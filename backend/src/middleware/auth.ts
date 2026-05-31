import crypto from 'node:crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { TelegramUser } from '../types/index.js'

declare module 'fastify' {
  interface FastifyRequest { telegramUser: TelegramUser }
}

export async function telegramAuthHook(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const initData = request.headers['x-telegram-init-data'] as string | undefined
  if (!initData) { reply.code(401).send({ error: 'Missing Telegram init data' }); return }
  try {
    request.telegramUser = validateInitData(initData, request.server.config.BOT_TOKEN)
  } catch {
    reply.code(401).send({ error: 'Invalid Telegram init data' })
  }
}

function validateInitData(initData: string, botToken: string): TelegramUser {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) throw new Error('No hash')
  params.delete('hash')
  const dataCheckString = [...params.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n')
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const expectedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  if (expectedHash !== hash) throw new Error('Hash mismatch')
  const userParam = params.get('user')
  if (!userParam) throw new Error('No user')
  return JSON.parse(userParam) as TelegramUser
}
