// D1 data-access helpers shared across route modules. Keep these thin —
// business logic belongs in the route handlers, this file just centralizes
// row-shape <-> API-shape mapping so it isn't duplicated everywhere.
import type { AuthUser } from '../types'

export interface UserRow {
  id: string
  username: string
  email: string | null
  password_hash: string
  password_salt: string
  password_algo: string
  name: string
  business_title: string | null
  unit_code: string | null
  short_label: string | null
  gradient_class: string | null
  phone: string | null
  avatar_url: string | null
  role_id: string
  online: number
  active: number
  deleted_at: string | null
  last_login_at: string | null
  must_change_password: number
  two_factor_secret: string | null
  two_factor_enabled: number
}

export interface RoleRow {
  id: string
  name: string
  description: string | null
  color: string | null
  perms_json: string
}

export async function findUserByUsername(db: D1Database, username: string): Promise<UserRow | null> {
  const row = await db
    .prepare('SELECT * FROM users WHERE username = ? AND deleted_at IS NULL')
    .bind(username)
    .first<UserRow>()
  return row ?? null
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
  const row = await db
    .prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL')
    .bind(id)
    .first<UserRow>()
  return row ?? null
}

export async function findRoleById(db: D1Database, roleId: string): Promise<RoleRow | null> {
  const row = await db.prepare('SELECT * FROM roles WHERE id = ?').bind(roleId).first<RoleRow>()
  return row ?? null
}

export function permsFromRole(role: RoleRow): string[] {
  try {
    const parsed = JSON.parse(role.perms_json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function hasPermission(perms: string[], required: string): boolean {
  if (perms.includes('*')) return true
  return perms.includes(required)
}

export async function toAuthUser(db: D1Database, u: UserRow): Promise<AuthUser> {
  const role = await findRoleById(db, u.role_id)
  const permissions = role ? permsFromRole(role) : []
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    businessTitle: u.business_title,
    unitCode: u.unit_code,
    shortLabel: u.short_label,
    gradientClass: u.gradient_class,
    phone: u.phone,
    avatarUrl: u.avatar_url,
    roleId: u.role_id,
    online: !!u.online,
    permissions,
    mustChangePassword: !!u.must_change_password,
    twoFactorEnabled: !!u.two_factor_enabled,
  }
}

export async function setTwoFactorSecret(db: D1Database, userId: string, secretBase32: string | null): Promise<void> {
  await db
    .prepare("UPDATE users SET two_factor_secret = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(secretBase32, userId)
    .run()
}

export async function setTwoFactorEnabled(db: D1Database, userId: string, enabled: boolean): Promise<void> {
  await db
    .prepare("UPDATE users SET two_factor_enabled = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(enabled ? 1 : 0, userId)
    .run()
}

export async function touchLastLogin(db: D1Database, userId: string): Promise<void> {
  await db
    .prepare("UPDATE users SET last_login_at = datetime('now'), online = 1 WHERE id = ?")
    .bind(userId)
    .run()
}

export async function markUserOffline(db: D1Database, userId: string): Promise<void> {
  await db.prepare('UPDATE users SET online = 0 WHERE id = ?').bind(userId).run()
}

export async function setMustChangePassword(db: D1Database, userId: string, value: boolean): Promise<void> {
  await db.prepare('UPDATE users SET must_change_password = ? WHERE id = ?').bind(value ? 1 : 0, userId).run()
}

// ---------------------------------------------------------------------------
// Login rate-limiting — sliding window over the `login_attempts` table.
// No Cloudflare in-memory limiter is available on Workers, so this uses D1
// as the counter store. Two independent limits are enforced by the caller:
// per-username and per-IP, both over the same WINDOW_MINUTES lookback.
// ---------------------------------------------------------------------------
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5
export const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 1

export async function recordLoginAttempt(
  db: D1Database,
  entry: { id: string; username: string; ip: string | null; success: boolean }
): Promise<void> {
  await db
    .prepare(`INSERT INTO login_attempts (id, username, ip, success) VALUES (?, ?, ?, ?)`)
    .bind(entry.id, entry.username, entry.ip, entry.success ? 1 : 0)
    .run()
}

// Returns true if the caller (by username OR by ip) has too many recent
// FAILED attempts and should be blocked. Successful logins don't count
// against the limit (only consecutive failures do).
export async function isLoginRateLimited(
  db: D1Database,
  username: string,
  ip: string | null
): Promise<boolean> {
  const windowStart = `-${LOGIN_RATE_LIMIT_WINDOW_MINUTES} minutes`
  const byUsername = await db
    .prepare(
      `SELECT COUNT(*) c FROM login_attempts
       WHERE username = ? AND success = 0 AND created_at > datetime('now', ?)`
    )
    .bind(username, windowStart)
    .first<{ c: number }>()
  if ((byUsername?.c ?? 0) >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) return true

  if (ip) {
    const byIp = await db
      .prepare(
        `SELECT COUNT(*) c FROM login_attempts
         WHERE ip = ? AND success = 0 AND created_at > datetime('now', ?)`
      )
      .bind(ip, windowStart)
      .first<{ c: number }>()
    if ((byIp?.c ?? 0) >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) return true
  }
  return false
}

export async function insertAuditLog(
  db: D1Database,
  entry: {
    id: string
    actorId: string | null
    action: string
    objectLabel?: string | null
    objectType?: string | null
    objectId?: string | null
    detail?: string | null
    ip?: string | null
    userAgent?: string | null
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_log (id, actor_id, action, object_label, object_type, object_id, detail, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      entry.id,
      entry.actorId,
      entry.action,
      entry.objectLabel ?? null,
      entry.objectType ?? null,
      entry.objectId ?? null,
      entry.detail ?? null,
      entry.ip ?? null,
      entry.userAgent ?? null
    )
    .run()
}
