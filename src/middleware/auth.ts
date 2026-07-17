// Auth middleware — verifies the access token (from httpOnly cookie
// `ctg_token` or `Authorization: Bearer` header, cookie takes precedence for
// browser navigation, header is used by the SPA's fetch/axios calls),
// then attaches the resolved AuthUser onto context (`c.set('user', ...)`).
//
// `requireAuth()` — 401 UNAUTHENTICATED if no valid token.
// `requirePermission(code)` — 403 INSUFFICIENT_PERMISSIONS if the user's role
//   lacks the given permission string (role perms may include '*' wildcard,
//   per the prototype's admin.js#ROLES 'super' role).
import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import type { AppEnv } from '../types'
import { verifyAccessToken } from '../lib/jwt'
import { findUserById, toAuthUser } from '../lib/db'

export const ACCESS_COOKIE_NAME = 'ctg_token'

function extractToken(c: any): string | null {
  const header = c.req.header('Authorization')
  if (header && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim()
  }
  const cookieToken = getCookie(c, ACCESS_COOKIE_NAME)
  return cookieToken ?? null
}

// Populates c.var.user when a valid token is present, but does NOT reject
// the request if absent — use requireAuth() on routes that must be protected.
export const attachUser = createMiddleware<AppEnv>(async (c, next) => {
  const token = extractToken(c)
  if (token) {
    const payload = await verifyAccessToken(token, c.env.JWT_SECRET)
    if (payload) {
      const userRow = await findUserById(c.env.DB, payload.sub)
      if (userRow && userRow.active) {
        c.set('user', await toAuthUser(c.env.DB, userRow))
      }
    }
  }
  await next()
})

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  if (!c.var.user) {
    return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Chưa đăng nhập hoặc token hết hạn' } }, 401)
  }
  await next()
})

export function requirePermission(permission: string) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.var.user
    if (!user) {
      return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Chưa đăng nhập hoặc token hết hạn' } }, 401)
    }
    const allowed = user.permissions.includes('*') || user.permissions.includes(permission)
    if (!allowed) {
      return c.json(
        { ok: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: `Thiếu quyền: ${permission}` } },
        403
      )
    }
    await next()
  })
}

// Convenience: any of the listed permissions grants access (OR semantics).
export function requireAnyPermission(...permissions: string[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const user = c.var.user
    if (!user) {
      return c.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Chưa đăng nhập hoặc token hết hạn' } }, 401)
    }
    const allowed = user.permissions.includes('*') || permissions.some((p) => user.permissions.includes(p))
    if (!allowed) {
      return c.json(
        { ok: false, error: { code: 'INSUFFICIENT_PERMISSIONS', message: `Thiếu quyền: ${permissions.join(' hoặc ')}` } },
        403
      )
    }
    await next()
  })
}
