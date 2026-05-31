import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import crypto from 'node:crypto'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

function extractUserIdFromInitData(initData: string, botToken: string): number | null {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null

    params.delete('hash')
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (expectedHash !== hash) return null

    const userParam = params.get('user')
    if (!userParam) return null

    const user = JSON.parse(userParam) as { id: number }
    return user.id
  } catch {
    return null
  }
}

const slotsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/slots', async (request, reply) => {
    const query = querySchema.safeParse(request.query)
    if (!query.success) {
      return reply.code(400).send({ error: query.error.flatten().fieldErrors })
    }

    const { date } = query.data
    const { supabase } = fastify

    const initDataHeader = request.headers['x-telegram-init-data'] as string | undefined
    const currentUserId = initDataHeader
      ? extractUserIdFromInitData(initDataHeader, fastify.config.BOT_TOKEN)
      : null

    const { data: courts, error: courtsError } = await supabase
      .from('courts')
      .select('id, name, description')
      .order('id')

    if (courtsError) {
      fastify.log.error(courtsError)
      return reply.code(500).send({ error: 'Failed to fetch courts', details: courtsError })
    }

    const { data: slots, error: slotsError } = await supabase
      .from('slots')
      .select('id, court_id, date, time_start, time_end, status')
      .eq('date', date)
      .order('time_start')

    if (slotsError) {
      fastify.log.error(slotsError)
      return reply.code(500).send({ error: 'Failed to fetch slots', details: slotsError })
    }

    let myBookingSlotIds: Set<number> = new Set()
    let bookingIdBySlotId: Map<number, number> = new Map()

    if (currentUserId) {
      const { data: myBookings } = await supabase
        .from('bookings')
        .select('id, slot_id')
        .eq('user_tg_id', currentUserId)
        .in(
          'slot_id',
          slots.map((s) => s.id),
        )

      if (myBookings) {
        for (const b of myBookings) {
          myBookingSlotIds.add(b.slot_id)
          bookingIdBySlotId.set(b.slot_id, b.id)
        }
      }
    }

    return {
      date,
      courts: courts.map((court) => ({
        court,
        slots: slots
          .filter((s) => s.court_id === court.id)
          .map((s) => ({
            ...s,
            court_name: court.name,
            status: myBookingSlotIds.has(s.id) ? 'mine' : s.status,
            booking_id: bookingIdBySlotId.get(s.id),
          })),
      })),
    }
  })
}

export default slotsPlugin
