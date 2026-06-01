import { Bot } from 'grammy'
import { startHandler } from './handlers/start.js'
import { sendReminders } from './handlers/notifications.js'

const token = process.env.BOT_TOKEN
if (!token) throw new Error('BOT_TOKEN is required')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env vars required')

const bot = new Bot(token)

bot.command('start', startHandler)

bot.start()
console.log('Bot started')

// Cron: check every 5 minutes
setInterval(async () => {
  try {
    await sendReminders(bot, supabaseUrl, supabaseKey)
  } catch (e) {
    console.error('Reminder check failed:', e)
  }
}, 5 * 60 * 1000)

// Run immediately on start
sendReminders(bot, supabaseUrl, supabaseKey).catch(console.error)
