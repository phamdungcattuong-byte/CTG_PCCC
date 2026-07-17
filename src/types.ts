// Cloudflare bindings available to every request, declared via wrangler.jsonc
// (d1_databases -> DB, r2_buckets -> R2) plus secrets/vars set through
// `wrangler secret put` (production) or `.dev.vars` (local dev).
export type Bindings = {
  DB: D1Database
  R2: R2Bucket
  JWT_SECRET: string
}

export type AppEnv = {
  Bindings: Bindings
  Variables: {
    user?: AuthUser
  }
}

// Shape of the authenticated user attached to context by the auth middleware.
// Mirrors GET /api/v1/auth/me response (minus password fields).
export interface AuthUser {
  id: string
  username: string
  name: string
  businessTitle: string | null
  unitCode: string | null
  shortLabel: string | null
  gradientClass: string | null
  phone: string | null
  avatarUrl: string | null
  roleId: string
  online: boolean
  permissions: string[]
  mustChangePassword?: boolean
}
