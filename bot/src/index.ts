import { bot } from './bot.js'
import { registerStartHandler } from './handlers/start.js'
import { registerNotificationHandlers } from './handlers/notifications.js'
registerStartHandler(bot)
registerNotificationHandlers(bot)
bot.catch((err) => { console.error('Bot error:', err) })
console.log('Starting bot...')
bot.start()
