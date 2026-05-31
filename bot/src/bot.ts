import { Bot } from 'grammy'
const token = process.env.BOT_TOKEN
if (!token) { console.error('BOT_TOKEN is not set'); process.exit(1) }
export const bot = new Bot(token)
