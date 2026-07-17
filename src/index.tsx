import { Hono } from 'hono'
import { renderer } from './renderer'
import type { AppEnv } from './types'
import { attachUser } from './middleware/auth'
import authRoutes from './routes/auth'

const app = new Hono<AppEnv>()

app.use(renderer)
app.use('*', attachUser)

app.route('/api/v1/auth', authRoutes)

app.get('/', (c) => {
  return c.render(<h1>CTG Command Center — booting…</h1>)
})

export default app
