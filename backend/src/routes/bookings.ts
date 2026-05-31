import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { telegramAuthHook } from '../middleware/auth.js'

const bookingsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', telegramAuthHook)

  fastify.get('/bookings/my', async (request, reply) => {
    const userId = request.telegramUser.id
    const { data, error } = await fastify.supabase
      .from('bookings')
      .select(`
        id, slot_id, user_tg_id, user_name, status, created_at,
        slot:slots (
          id, date, time_start, time_end,
          court:courts (id, name, description, maps_url)
        )
      `)
      .eq('user_tg_id', userId)
      .eq('status', 'active')
      .gte('slot.date', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })

    if (error) {
      fastify.log.error(error)
      return reply.code(500).send({ error: 'Failed to fetch bookings' })
    }

    return data
  })

  fastify.post('/bookings', async (request, reply) => {
    const bodySchema = z.object({ slot_id: z.number().int().positive() })
    const body = bodySchema.safeParse(request.body)
    if (!body.success) {
      return reply.code(400).send({ error: body.error.flatten().fieldErrors })
    }

    const user = request.telegramUser
    const { slot_id } = body.data

    const { data: slot, error: slotError } = await fastify.supabase
      .from('slots')
      .select('id, date, time_start, status')
      .eq('id', slot_id)
      .single()

    if (slotError || !slot) {
      return reply.code(404).send({ error: 'Slot not found' })
    }

    if (slot.status !== 'free') {
      return reply.code(409).send({ error: 'Slot is already occupied' })
    }

    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    await fastify.supabase.from('users').upsert({
      tg_id: user.id,
      username: user.username ?? null,
      first_name: user.first_name,
      last_name: user.last_name ?? null,
    }, { onConflict: 'tg_id' })

    const { error: updateError } = await fastify.supabase
      .from('slots')
      .update({ status: 'occupied' })
      .eq('id', slot_id)
      .eq('status', 'free')

    if (updateError) {
      return reply.code(409).send({ error: 'Slot was just taken' })
    }

    const { data: booking, error: bookingError } = await fastify.supabase
      .from('bookings')
      .insert({ slot_id, user_tg_id: user.id, user_name: userName, status: 'active' })
      .select()
      .single()

    if (bookingError) {
      fastify.log.error(bookingError)
      await fastify.supabase.from('slots').update({ status: 'free' }).eq('id', slot_id)
      return reply.code(500).send({ error: 'Failed to create booking' })
    }

    reply.code(201).send(booking)
  })

  fastify.delete('/bookings/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.telegramUser.id

    const { data: booking, error: fetchError } = await fastify.supabase
      .from('bookings')
      .select('id, slot_id, user_tg_id, status')
      .eq('id', id)
      .eq('user_tg_id', userId)
      .single()

    if (fetchError || !booking) {
      return reply.code(404).send({ error: 'Booking not found' })
    }

    if (booking.status === 'cancelled') {
      return reply.code(400).send({ error: 'Booking already cancelled' })
    }

    const { error: cancelError } = await fastify.supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (cancelError) {
      return reply.code(500).send({ error: 'Failed to cancel booking' })
    }

    await fastify.supabase.from('slots').update({ status: 'free' }).eq('id', booking.slot_id)

    reply.code(204).send()
  })
}

export default bookingsPlugin
