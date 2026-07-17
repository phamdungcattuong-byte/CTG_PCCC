// Auth routes per docs/API-CONTRACT.md §1 (2FA endpoints deferred — not in
// scope for Phase 1). Login rate-limiting (5 failed attempts/min, checked by
// both username and IP) is implemented via a D1-backed sliding window — see
// isLoginRateLimited/recordLoginAttempt in ../lib/db (Cloudflare Workers has
// no in-memory limiter, so the counter lives in D1 instead of KV/memory).
import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import type { AppEnv } from '../types'
import { verifyPassword, hashPassword, newUuid } from '../lib/crypto'
import {
  findUserByUsername, findUserById, toAuthUser, touchLastLogin, markUserOffline, insertAuditLog,
  isLoginRateLimited, recordLoginAttempt, setMustChangePassword,
  setTwoFactorSecret, setTwoFactorEnabled,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS, LOGIN_RATE_LIMIT_WINDOW_MINUTES,
} from '../lib/db'
import {
  signAccessToken, newRefreshTokenPlain, hashRefreshToken, refreshTokenExpiryIso,
  signPending2faToken, verifyPending2faToken,
} from '../lib/jwt'
import { ACCESS_COOKIE_NAME, requireAuth } from '../middleware/auth'
import { randomBase32Secret, verifyTotp, buildOtpAuthUrl } from '../lib/totp'

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

// Shared "finish login" step — issues access+refresh tokens, sets cookies,
// touches last_login_at, writes the audit log. Used by both the normal
// (no 2FA) login path and the 2FA login-verify path so the two stay
// perfectly in sync.
async function completeLogin(c: any, userRow: { id: string; username: string; role_id: string }) {
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

  const fullUserRow = await findUserById(c.env.DB, userRow.id)
  const authUser = await toAuthUser(c.env.DB, fullUserRow!)
  return { token: accessToken, user: authUser }
}

// POST /api/v1/auth/login  { username, password } -> { token, user }
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu username hoặc password' } }, 400)
  }
  const { username, password } = body
  const ip = c.req.header('CF-Connecting-IP') ?? null

  const limited = await isLoginRateLimited(c.env.DB, username, ip)
  if (limited) {
    return c.json(
      {
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: `Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${LOGIN_RATE_LIMIT_WINDOW_MINUTES} phút.`,
        },
      },
      429
    )
  }

  const userRow = await findUserByUsername(c.env.DB, username)
  if (!userRow || !userRow.active) {
    await recordLoginAttempt(c.env.DB, { id: newUuid(), username, ip, success: false })
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sai tài khoản hoặc mật khẩu' } }, 401)
  }

  const valid = await verifyPassword(password, userRow.password_salt, userRow.password_hash)
  if (!valid) {
    await recordLoginAttempt(c.env.DB, { id: newUuid(), username, ip, success: false })
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sai tài khoản hoặc mật khẩu' } }, 401)
  }
  await recordLoginAttempt(c.env.DB, { id: newUuid(), username, ip, success: true })

  // If 2FA is enabled on this account, password alone is not enough — issue
  // a short-lived pending token (no session cookie yet) and require the
  // client to call /auth/2fa/login-verify with a TOTP code to finish login.
  if (userRow.two_factor_enabled && userRow.two_factor_secret) {
    const pendingToken = await signPending2faToken(userRow.id, c.env.JWT_SECRET)
    return c.json({ ok: true, data: { twoFactorRequired: true, pendingToken } })
  }

  const data = await completeLogin(c, userRow)
  return c.json({ ok: true, data })
})

// POST /api/v1/auth/2fa/login-verify  { pendingToken, code } -> { token, user }
// Second step of login when the account has 2FA enabled. pendingToken comes
// from the twoFactorRequired response of /auth/login (5-minute validity).
auth.post('/2fa/login-verify', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.pendingToken !== 'string' || typeof body.code !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu pendingToken hoặc code' } }, 400)
  }
  const pending = await verifyPending2faToken(body.pendingToken, c.env.JWT_SECRET)
  if (!pending) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'pendingToken không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại' } }, 401)
  }
  const userRow = await findUserById(c.env.DB, pending.sub)
  if (!userRow || !userRow.active || !userRow.two_factor_enabled || !userRow.two_factor_secret) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Tài khoản không hợp lệ' } }, 401)
  }
  const ok = await verifyTotp(userRow.two_factor_secret, body.code)
  if (!ok) {
    await insertAuditLog(c.env.DB, {
      id: newUuid(), actorId: userRow.id, action: 'login', objectLabel: 'Hệ thống',
      detail: 'Nhập sai mã 2FA khi đăng nhập', ip: c.req.header('CF-Connecting-IP') ?? null, userAgent: c.req.header('User-Agent') ?? null,
    })
    return c.json({ ok: false, error: { code: 'INVALID_2FA_CODE', message: 'Mã xác thực 2FA không đúng' } }, 401)
  }

  const data = await completeLogin(c, userRow)
  return c.json({ ok: true, data })
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

// POST /api/v1/auth/change-password  { currentPassword, newPassword } -> { ok }
// Self-service password change. Also clears must_change_password so the
// forced-change gate (set for all seeded default-password accounts) is
// satisfied. Requires the CURRENT password to be supplied and valid — this
// is intentional even for the forced first-change flow, since the "current"
// password in that case is the known default the user just logged in with.
auth.post('/change-password', requireAuth, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu currentPassword hoặc newPassword' } }, 400)
  }
  if (body.newPassword.length < 8) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Mật khẩu mới phải có ít nhất 8 ký tự' } }, 400)
  }
  if (body.newPassword === body.currentPassword) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Mật khẩu mới phải khác mật khẩu hiện tại' } }, 400)
  }

  const userId = c.var.user!.id
  const userRow = await findUserById(c.env.DB, userId)
  if (!userRow) {
    return c.json({ ok: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy người dùng' } }, 404)
  }

  const valid = await verifyPassword(body.currentPassword, userRow.password_salt, userRow.password_hash)
  if (!valid) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Mật khẩu hiện tại không đúng' } }, 401)
  }

  const { hash, salt } = await hashPassword(body.newPassword)
  await c.env.DB
    .prepare(`UPDATE users SET password_hash = ?, password_salt = ?, must_change_password = 0, updated_at = datetime('now') WHERE id = ?`)
    .bind(hash, salt, userId)
    .run()

  await insertAuditLog(c.env.DB, {
    id: newUuid(),
    actorId: userId,
    action: 'update',
    objectType: 'user',
    objectId: userId,
    objectLabel: userRow.name,
    detail: 'Người dùng tự đổi mật khẩu',
    ip: c.req.header('CF-Connecting-IP') ?? null,
    userAgent: c.req.header('User-Agent') ?? null,
  })

  return c.json({ ok: true, data: { ok: true } })
})

// ---------------------------------------------------------------------------
// 2FA self-service (TOTP) — was deferred in Phase 1 per docs/API-CONTRACT.md
// §1 note; the `two_factor_secret`/`two_factor_enabled` columns already
// existed on `users` (migrations/0002) with no endpoint. Implemented here
// using Web Crypto HMAC-SHA1 (see ../lib/totp) since Cloudflare Workers has
// no Node `crypto`/`Buffer` for a standard npm TOTP package.
//
// Flow: POST /2fa/setup (generates + stores a NEW secret, disabled until
// confirmed) -> user scans QR / enters secret in an authenticator app ->
// POST /2fa/confirm { code } (verifies once, flips two_factor_enabled=1)
// -> POST /2fa/disable { code } (requires a valid current code to turn off).
// ---------------------------------------------------------------------------

// POST /api/v1/auth/2fa/setup -> { secret, otpauthUrl }
// Requires current login. Generates a fresh secret and stores it UN-enabled
// (login flow only requires 2FA once two_factor_enabled=1), overwriting any
// previous not-yet-confirmed secret so re-scanning always works cleanly.
auth.post('/2fa/setup', requireAuth, async (c) => {
  const user = c.var.user!
  const secret = randomBase32Secret()
  await setTwoFactorSecret(c.env.DB, user.id, secret)
  const otpauthUrl = buildOtpAuthUrl(secret, user.username)
  return c.json({ ok: true, data: { secret, otpauthUrl } })
})

// POST /api/v1/auth/2fa/confirm  { code } -> { ok, twoFactorEnabled: true }
// Verifies the 6-digit code generated from the secret issued by /2fa/setup,
// then turns 2FA ON for the account.
auth.post('/2fa/confirm', requireAuth, async (c) => {
  const user = c.var.user!
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.code !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu code' } }, 400)
  }
  const userRow = await findUserById(c.env.DB, user.id)
  if (!userRow || !userRow.two_factor_secret) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Chưa khởi tạo 2FA — gọi /2fa/setup trước' } }, 400)
  }
  const ok = await verifyTotp(userRow.two_factor_secret, body.code)
  if (!ok) {
    return c.json({ ok: false, error: { code: 'INVALID_2FA_CODE', message: 'Mã xác thực không đúng' } }, 401)
  }
  await setTwoFactorEnabled(c.env.DB, user.id, true)
  await insertAuditLog(c.env.DB, {
    id: newUuid(), actorId: user.id, action: 'update', objectType: 'user', objectId: user.id,
    objectLabel: user.name, detail: 'Bật xác thực 2 lớp (2FA)',
    ip: c.req.header('CF-Connecting-IP') ?? null, userAgent: c.req.header('User-Agent') ?? null,
  })
  return c.json({ ok: true, data: { ok: true, twoFactorEnabled: true } })
})

// POST /api/v1/auth/2fa/disable  { code } -> { ok, twoFactorEnabled: false }
// Requires a currently-valid code (not just being logged in) so a hijacked
// session token alone cannot turn off 2FA protection.
auth.post('/2fa/disable', requireAuth, async (c) => {
  const user = c.var.user!
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.code !== 'string') {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: 'Thiếu code' } }, 400)
  }
  const userRow = await findUserById(c.env.DB, user.id)
  if (!userRow || !userRow.two_factor_enabled || !userRow.two_factor_secret) {
    return c.json({ ok: false, error: { code: 'VALIDATION_FAILED', message: '2FA chưa được bật' } }, 400)
  }
  const ok = await verifyTotp(userRow.two_factor_secret, body.code)
  if (!ok) {
    return c.json({ ok: false, error: { code: 'INVALID_2FA_CODE', message: 'Mã xác thực không đúng' } }, 401)
  }
  await setTwoFactorEnabled(c.env.DB, user.id, false)
  await setTwoFactorSecret(c.env.DB, user.id, null)
  await insertAuditLog(c.env.DB, {
    id: newUuid(), actorId: user.id, action: 'update', objectType: 'user', objectId: user.id,
    objectLabel: user.name, detail: 'Tắt xác thực 2 lớp (2FA)',
    ip: c.req.header('CF-Connecting-IP') ?? null, userAgent: c.req.header('User-Agent') ?? null,
  })
  return c.json({ ok: true, data: { ok: true, twoFactorEnabled: false } })
})

// GET /api/v1/auth/2fa/status -> { twoFactorEnabled }
auth.get('/2fa/status', requireAuth, async (c) => {
  return c.json({ ok: true, data: { twoFactorEnabled: !!c.var.user!.twoFactorEnabled } })
})

export default auth
