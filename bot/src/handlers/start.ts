import { Context } from 'grammy'
import { createClient } from '@supabase/supabase-js'

export async function startHandler(ctx: Context) {
  const user = ctx.from
  if (!user) return

  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  await supabase.from('users').upsert({
    tg_id: user.id,
    username: user.username ?? null,
    first_name: user.first_name,
    last_name: user.last_name ?? null,
  }, { onConflict: 'tg_id' })

  await ctx.reply(
    `👋 Привет, ${user.first_name}!\n\nДобро пожаловать в сервис бронирования теннисных кортов Орехово.\n\nНажми кнопку ниже чтобы открыть расписание и забронировать корт.`,
    {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🎾 Открыть расписание',
            web_app: { url: process.env.MINI_APP_URL! }
          }
        ]]
      }
    }
  )
}
