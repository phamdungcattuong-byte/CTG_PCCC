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
  }
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
