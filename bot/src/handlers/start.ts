import type { Bot } from 'grammy'
import { InlineKeyboard } from 'grammy'
const MINI_APP_URL = process.env.MINI_APP_URL ?? 'https://t.me/your_bot/app'
export function registerStartHandler(bot: Bot): void {
  bot.command('start', async (ctx) => {
    const firstName = ctx.from?.first_name ?? 'игрок'
    const keyboard = new InlineKeyboard().webApp('🎾 Открыть расписание', MINI_APP_URL)
    await ctx.reply(`Привет, ${firstName}! 👋\n\nЯ помогу забронировать теннисный корт.\n\nПравила:\n• Максимум 2 активных бронирования\n• Бронирование до 7 дней вперёд\n• Отмена не позже чем за 2 часа`, { reply_markup: keyboard })
  })
}
