// JWT sign/verify helpers built on Hono's built-in `hono/utils/jwt` (HMAC-SHA256).
// Access tokens are short-lived and stateless; refresh tokens are opaque
// random strings whose SHA-256 hash is stored in the `refresh_tokens` table
// (see migrations/0002_core_operations.sql) so they can be revoked.
import { Jwt } from 'hono/utils/jwt'
import { sha256Hex, newUuid } from './crypto'

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60 // 15 minutes
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 3600 // 30 days

export interface AccessTokenPayload {
  sub: string // user id
  username: string
  roleId: string
  iat: number
  exp: number
}

export async function signAccessToken(userId: string, username: string, roleId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: AccessTokenPayload = {
    sub: userId,
    username,
    roleId,
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  }
  return Jwt.sign(payload as unknown as Record<string, unknown>, secret, 'HS256')
}

export async function verifyAccessToken(token: string, secret: string): Promise<AccessTokenPayload | null> {
  try {
    const payload = await Jwt.verify(token, secret, 'HS256')
    return payload as unknown as AccessTokenPayload
  } catch {
    return null
  }
}

export function newRefreshTokenPlain(): string {
  return newUuid() + '.' + newUuid()
}

export async function hashRefreshToken(plain: string): Promise<string> {
  return sha256Hex(plain)
}

export function refreshTokenExpiryIso(): string {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000).toISOString()
}

export const ACCESS_TOKEN_TTL = ACCESS_TOKEN_TTL_SECONDS
export const REFRESH_TOKEN_TTL = REFRESH_TOKEN_TTL_SECONDS

// Short-lived token issued after a correct password but pending 2FA code
// verification (login not yet complete — no session cookie set for this).
const PENDING_2FA_TTL_SECONDS = 5 * 60 // 5 minutes

export interface Pending2faPayload {
  sub: string // user id
  typ: '2fa_pending'
  iat: number
  exp: number
}

export async function signPending2faToken(userId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: Pending2faPayload = { sub: userId, typ: '2fa_pending', iat: now, exp: now + PENDING_2FA_TTL_SECONDS }
  return Jwt.sign(payload as unknown as Record<string, unknown>, secret, 'HS256')
}

export async function verifyPending2faToken(token: string, secret: string): Promise<Pending2faPayload | null> {
  try {
    const payload = (await Jwt.verify(token, secret, 'HS256')) as unknown as Pending2faPayload
    if (payload.typ !== '2fa_pending') return null
    return payload
  } catch {
    return null
  }
}
