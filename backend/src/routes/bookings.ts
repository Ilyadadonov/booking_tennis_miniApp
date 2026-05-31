import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { telegramAuthHook } from '../middleware/auth.js'

const MAX_ACTIVE_BOOKINGS = 2
const CANCEL_WINDOW_HOURS = 2

const bookingsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', telegramAuthHook)

  fastify.get('/bookings/my', async (request, reply) => {
    const { data, error } = await fastify.supabase.from('bookings').select('id, slot_id, user_tg_id, user_name, created_at, slot:slots(id, date, time_start, time_end, court:courts(id, name, description))').eq('user_tg_id', request.telegramUser.id).order('created_at', { ascending: false })
    if (error) return reply.code(500).send({ error: 'Failed to fetch bookings' })
    return data
  })

  fastify.post('/bookings', async (request, reply) => {
    const body = z.object({ slot_id: z.number().int().positive() }).safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: body.error.flatten().fieldErrors })
    const user = request.telegramUser
    const { slot_id } = body.data
    const { data: slot, error: slotError } = await fastify.supabase.from('slots').select('id, date, time_start, status').eq('id', slot_id).single()
    if (slotError || !slot) return reply.code(404).send({ error: 'Slot not found' })
    if (slot.status !== 'free') return reply.code(409).send({ error: 'Slot is already occupied' })
    const slotDT = new Date(`${slot.date}T${slot.time_start}`)
    const now = new Date()
    if (slotDT <= new Date(now.getTime() + 60*60*1000)) return reply.code(400).send({ error: 'Cannot book less than 1 hour before start' })
    if (slotDT > new Date(now.getTime() + 7*24*60*60*1000)) return reply.code(400).send({ error: 'Cannot book more than 7 days in advance' })
    const { count } = await fastify.supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_tg_id', user.id)
    if ((count ?? 0) >= MAX_ACTIVE_BOOKINGS) return reply.code(400).send({ error: `Maximum ${MAX_ACTIVE_BOOKINGS} active bookings allowed` })
    const { error: updateError } = await fastify.supabase.from('slots').update({ status: 'occupied' }).eq('id', slot_id).eq('status', 'free')
    if (updateError) return reply.code(409).send({ error: 'Slot was just taken' })
    const userName = [user.first_name, user.last_name].filter(Boolean).join(' ')
    const { data: booking, error: bookingError } = await fastify.supabase.from('bookings').insert({ slot_id, user_tg_id: user.id, user_name: userName }).select().single()
    if (bookingError) { await fastify.supabase.from('slots').update({ status: 'free' }).eq('id', slot_id); return reply.code(500).send({ error: 'Failed to create booking' }) }
    reply.code(201).send(booking)
  })

  fastify.delete('/bookings/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { data: booking, error } = await fastify.supabase.from('bookings').select('id, slot_id, user_tg_id, slot:slots(date, time_start)').eq('id', id).eq('user_tg_id', request.telegramUser.id).single()
    if (error || !booking) return reply.code(404).send({ error: 'Booking not found' })
    const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
    const deadline = new Date(new Date(`${slot.date}T${slot.time_start}`).getTime() - CANCEL_WINDOW_HOURS*60*60*1000)
    if (new Date() > deadline) return reply.code(400).send({ error: `Cannot cancel less than ${CANCEL_WINDOW_HOURS} hours before slot` })
    const { error: deleteError } = await fastify.supabase.from('bookings').delete().eq('id', id)
    if (deleteError) return reply.code(500).send({ error: 'Failed to cancel booking' })
    await fastify.supabase.from('slots').update({ status: 'free' }).eq('id', booking.slot_id)
    reply.code(204).send()
  })
}

export default bookingsPlugin
