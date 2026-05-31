import type { Bot } from 'grammy'
export interface BookingNotification { user_tg_id: number; type: 'confirmed' | 'cancelled'; court_name: string; date: string; time_start: string; time_end: string }
export async function sendBookingNotification(bot: Bot, n: BookingNotification): Promise<void> {
  const dateFormatted = new Date(n.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeRange = `${n.time_start.slice(0,5)}–${n.time_end.slice(0,5)}`
  const text = n.type === 'confirmed' ? `✅ Бронирование подтверждено!\n\n🎾 ${n.court_name}\n📅 ${dateFormatted}\n⏰ ${timeRange}` : `❌ Бронирование отменено\n\n🎾 ${n.court_name}\n📅 ${dateFormatted}\n⏰ ${timeRange}`
  try { await bot.api.sendMessage(n.user_tg_id, text) } catch (err) { console.error(err) }
}
export function registerNotificationHandlers(bot: Bot): void {
  bot.command('mybookings', async (ctx) => { await ctx.reply('Открой приложение, чтобы увидеть свои бронирования 👆') })
}
