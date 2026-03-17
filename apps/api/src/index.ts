import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/health', (c) => c.json({ status: 'ok' }))

// TODO: Live database query endpoint will be added in Phase 3
// app.post('/query', ...)

export default {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  fetch: app.fetch,
}
