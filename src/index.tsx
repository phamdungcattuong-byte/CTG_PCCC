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
import pagesRoutes from './routes/pages'

const app = new Hono<AppEnv>()

app.use(renderer)
app.use('*', attachUser)

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1', bootstrapRoutes)
app.route('/api/v1', eventsRoutes)
app.route('/api/v1', notificationsRoutes)
app.route('/api/v1/users', usersRoutes)
app.route('/api/v1/relief-projects', reliefRoutes)
app.route('/api/v1/incidents', incidentsRoutes)

app.route('/', pagesRoutes)

export default app
