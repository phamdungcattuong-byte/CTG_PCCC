// Auth routes per docs/API-CONTRACT.md §1 (2FA endpoints deferred — not in
// scope for Phase 1). Login rate-limiting (5/min/IP per contract) is left as
// a documented TODO — Cloudflare Workers has no built-in in-memory limiter;
// would need a D1/KV counter, deferred to Phase 2.
import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { AppEnv } from '../types'
import { verifyPassword, newUuid } from '../lib/crypto'
import { findUserByUsername, findUserById, toAuthUser, touchLastLogin, markUserOffline, insertAuditLog } from '../lib/db'
import { signAccessToken, newRefreshTokenPlain, hashRefreshToken, refreshTokenExpiryIso } from '../lib/jwt'
import { ACCESS_COOKIE_NAME, requireAuth } from '../middleware/auth'

const auth = new Hono<AppEnv>()

const REFRESH_COOKIE_NAME = 'ctg_refresh'

function cookieOpts(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

// POST /api/v1/auth/login  { username, password } -> { token, user }
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu username hoặc password' } }, 400)
  }
  const { username, password } = body

  const userRow = await findUserByUsername(c.env.DB, username)
  if (!userRow || !userRow.active) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sai tài khoản hoặc mật khẩu' } }, 401)
  }

  const valid = await verifyPassword(password, userRow.password_salt, userRow.password_hash)
  if (!valid) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sai tài khoản hoặc mật khẩu' } }, 401)
  }

  const accessToken = await signAccessToken(userRow.id, userRow.username, userRow.role_id, c.env.JWT_SECRET)

  const refreshPlain = newRefreshTokenPlain()
  const refreshHash = await hashRefreshToken(refreshPlain)
  await c.env.DB
    .prepare(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, user_agent, ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(newUuid(), userRow.id, refreshHash, refreshTokenExpiryIso(), c.req.header('User-Agent') ?? null, c.req.header('CF-Connecting-IP') ?? null)
    .run()

  await touchLastLogin(c.env.DB, userRow.id)
  await insertAuditLog(c.env.DB, {
    id: newUuid(),
    actorId: userRow.id,
    action: 'login',
    objectLabel: 'Hệ thống',
    detail: `Đăng nhập từ IP ${c.req.header('CF-Connecting-IP') ?? 'unknown'}`,
    ip: c.req.header('CF-Connecting-IP') ?? null,
    userAgent: c.req.header('User-Agent') ?? null,
  })

  setCookie(c, ACCESS_COOKIE_NAME, accessToken, cookieOpts(15 * 60))
  setCookie(c, REFRESH_COOKIE_NAME, refreshPlain, cookieOpts(30 * 24 * 3600))

  const authUser = await toAuthUser(c.env.DB, userRow)
  return c.json({ ok: true, data: { token: accessToken, user: authUser } })
})

// POST /api/v1/auth/logout
auth.post('/logout', requireAuth, async (c) => {
  const user = c.var.user!
  await markUserOffline(c.env.DB, user.id)
  deleteCookie(c, ACCESS_COOKIE_NAME, { path: '/' })
  deleteCookie(c, REFRESH_COOKIE_NAME, { path: '/' })
  return c.json({ ok: true, data: { ok: true } })
})

// POST /api/v1/auth/refresh  (reads refresh cookie, issues new access token)
auth.post('/refresh', async (c) => {
  const refreshPlain = getCookie(c, REFRESH_COOKIE_NAME)
  if (!refreshPlain) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Không có refresh token' } }, 401)
  }
  const refreshHash = await hashRefreshToken(refreshPlain)
  const row = await c.env.DB
    .prepare(
      `SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now')`
    )
    .bind(refreshHash)
    .first<{ id: string; user_id: string }>()

  if (!row) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Refresh token không hợp lệ hoặc đã hết hạn' } }, 401)
  }

  const userRow = await findUserById(c.env.DB, row.user_id)
  if (!userRow || !userRow.active) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Người dùng không tồn tại' } }, 401)
  }

  const accessToken = await signAccessToken(userRow.id, userRow.username, userRow.role_id, c.env.JWT_SECRET)
  setCookie(c, ACCESS_COOKIE_NAME, accessToken, cookieOpts(15 * 60))

  return c.json({ ok: true, data: { token: accessToken } })
})

// GET /api/v1/auth/me
auth.get('/me', requireAuth, async (c) => {
  return c.json({ ok: true, data: c.var.user })
})

export default auth
