import { Hono } from 'hono'
import { renderer } from './renderer'
import type { AppEnv } from './types'
import { attachUser } from './middleware/auth'
import authRoutes from './routes/auth'
import bootstrapRoutes from './routes/bootstrap'
import eventsRoutes from './routes/events'
import notificationsRoutes from './routes/notifications'
import usersRoutes from './routes/users'
import reliefRoutes from './routes/relief'
import incidentsRoutes from './routes/incidents'
import aiRoutes from './routes/ai'
import camerasRoutes from './routes/cameras'
import pagesRoutes from './routes/pages'

const app = new Hono<AppEnv>()

app.use(renderer)
app.use('*', attachUser)

app.route('/api/v1/auth', authRoutes)

// SECURITY: server-side enforcement of the forced-password-change gate.
// `mustChangePassword` was previously only enforced by a client-side modal
// in bootstrap.js — any direct API call (curl, script, modified frontend)
// could bypass it entirely and use every protected endpoint indefinitely
// with the known default password still active. Found via live testing
// (see /tmp/pentest/run_tests.sh "bonus" check). /api/v1/auth/* is
// exempted so the user can still call /me, /logout, /change-password and
// the 2FA endpoints while stuck behind this gate.
app.use('/api/v1/*', async (c, next) => {
  if (c.req.path.startsWith('/api/v1/auth')) return next()
  const user = c.var.user
  if (user && user.mustChangePassword) {
    return c.json(
      { ok: false, error: { code: 'MUST_CHANGE_PASSWORD', message: 'Bạn phải đổi mật khẩu trước khi tiếp tục sử dụng hệ thống' } },
      403
    )
  }
  await next()
})

app.route('/api/v1', bootstrapRoutes)
app.route('/api/v1', eventsRoutes)
app.route('/api/v1', notificationsRoutes)
app.route('/api/v1/users', usersRoutes)
app.route('/api/v1/relief-projects', reliefRoutes)
app.route('/api/v1/incidents', incidentsRoutes)
app.route('/api/v1/ai', aiRoutes)
app.route('/api/v1/cameras', camerasRoutes)

app.route('/', pagesRoutes)

export default app
