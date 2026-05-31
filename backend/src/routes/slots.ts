import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'

const querySchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

function extractUserId(initData: string, botToken: string): number | null {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null
    params.delete('hash')
    const dcs = [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n')
    const sk = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    if (crypto.createHmac('sha256', sk).update(dcs).digest('hex') !== hash) return null
    const u = params.get('user')
    return u ? (JSON.parse(u) as { id: number }).id : null
  } catch { return null }
}

const slotsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/slots', async (request, reply) => {
    const query = querySchema.safeParse(request.query)
    if (!query.success) return reply.code(400).send({ error: query.error.flatten().fieldErrors })
    const { date } = query.data
    const initDataHeader = request.headers['x-telegram-init-data'] as string | undefined
    const currentUserId = initDataHeader ? extractUserId(initDataHeader, fastify.config.BOT_TOKEN) : null
    const { data: courts, error: courtsError } = await fastify.supabase.from('courts').select('id, name, description').order('id')
    if (courtsError) return reply.code(500).send({ error: 'Failed to fetch courts' })
    const { data: slots, error: slotsError } = await fastify.supabase.from('slots').select('id, court_id, date, time_start, time_end, status').eq('date', date).order('time_start')
    if (slotsError) return reply.code(500).send({ error: 'Failed to fetch slots' })
    let mySlotIds = new Set<number>()
    let bookingIdBySlotId = new Map<number, number>()
    if (currentUserId) {
      const { data: myBookings } = await fastify.supabase.from('bookings').select('id, slot_id').eq('user_tg_id', currentUserId).in('slot_id', slots.map(s => s.id))
      if (myBookings) { for (const b of myBookings) { mySlotIds.add(b.slot_id); bookingIdBySlotId.set(b.slot_id, b.id) } }
    }
    return { date, courts: courts.map(court => ({ court, slots: slots.filter(s => s.court_id === court.id).map(s => ({ ...s, court_name: court.name, status: mySlotIds.has(s.id) ? 'mine' : s.status, booking_id: bookingIdBySlotId.get(s.id) })) })) }
  })
}

export default slotsPlugin
