import Fastify from 'fastify'
import cors from '@fastify/cors'
import { loadConfig } from './config.js'
import supabasePlugin from './plugins/supabase.js'
import slotsRoute from './routes/slots.js'
import bookingsRoute from './routes/bookings.js'

declare module 'fastify' {
  interface FastifyInstance {
    config: ReturnType<typeof loadConfig>
  }
}

async function main() {
  const config = loadConfig()
  const fastify = Fastify({ logger: true })
  fastify.decorate('config', config)
  await fastify.register(cors, {
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
  })
  await fastify.register(supabasePlugin)
  await fastify.register(slotsRoute)
  await fastify.register(bookingsRoute)
  fastify.get('/health', async () => ({ status: 'ok' }))
  await fastify.listen({ port: config.PORT, host: config.HOST })
}

main().catch((err) => { console.error(err); process.exit(1) })
