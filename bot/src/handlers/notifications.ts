import { Bot } from 'grammy'
import { createClient } from '@supabase/supabase-js'

export async function sendReminders(bot: Bot, supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date()
  const windowStart = new Date(now.getTime() + 25 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 35 * 60 * 1000)

  const pad = (n: number) => String(n).padStart(2, '0')
  const toTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  const toDate = (d: Date) => d.toISOString().split('T')[0]

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id, user_tg_id, user_name, notified_at,
      slot:slots (
        date, time_start, time_end,
        court:courts (name)
      )
    `)
    .eq('status', 'active')
    .is('notified_at', null)

  if (error || !bookings) return

  for (const booking of bookings) {
    const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
    if (!slot) continue

    const court = Array.isArray(slot.court) ? slot.court[0] : slot.court
    const slotDateTime = new Date(`${slot.date}T${slot.time_start}`)

    if (slotDateTime < windowStart || slotDateTime > windowEnd) continue

    try {
      await bot.api.sendMessage(
        booking.user_tg_id,
        `⏰ Напоминание!\n\nЧерез 30 минут у вас бронь:\n🎾 ${court.name}\n📅 ${new Date(slot.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}\n⏱ ${slot.time_start.slice(0, 5)}–${slot.time_end.slice(0, 5)}\n\nХорошей игры! 🏆`
      )

      await supabase
        .from('bookings')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', booking.id)
    } catch (e) {
      console.error(`Failed to notify user ${booking.user_tg_id}:`, e)
    }
  }
}
