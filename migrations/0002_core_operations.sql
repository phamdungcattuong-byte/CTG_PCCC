-- ============================================================================
-- 0002_core_operations.sql
-- CTG Command Center — Core operational tables: Users/Auth, RBAC assignment,
-- Events (activation instances), Tasks (runtime), Incidents, Notifications,
-- Audit log, Sessions/Refresh tokens.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- USERS — production auth accounts (extends prototype PEOPLE with credentials)
-- id kept as TEXT to preserve legacy slugs ('ct','tgd','cht',...) as primary
-- key for easy FK reuse across seeded mock data; new users get a uuid string.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,        -- slug (legacy) or uuid (new)
  username        TEXT UNIQUE NOT NULL,    -- login handle (derived from slug or email)
  email           TEXT UNIQUE,
  password_hash   TEXT NOT NULL,           -- PBKDF2 derived hash
  password_salt   TEXT NOT NULL,           -- base64 salt
  password_algo   TEXT NOT NULL DEFAULT 'PBKDF2-SHA256-100000',
  name            TEXT NOT NULL,
  business_title  TEXT,                    -- 'role' field in prototype (chức vụ, not RBAC)
  unit_code       TEXT REFERENCES units(code),
  short_label     TEXT,                    -- 2-3 char avatar initials
  gradient_class  TEXT,                    -- CSS avatar gradient
  phone           TEXT,
  avatar_url      TEXT,
  role_id         TEXT NOT NULL REFERENCES roles(id),
  online          INTEGER NOT NULL DEFAULT 0,
  last_login_at   TEXT,
  two_factor_secret TEXT,
  two_factor_enabled INTEGER NOT NULL DEFAULT 0,
  active          INTEGER NOT NULL DEFAULT 1,
  deleted_at      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_unit ON users(unit_code);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- Refresh tokens (JWT access token is short-lived & stateless; refresh is stored)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,     -- uuid
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  TEXT NOT NULL,        -- SHA-256 of the actual refresh token
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent  TEXT,
  ip          TEXT
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ---------------------------------------------------------------------------
-- SITES.staff — realtime roster: which users are on-site (optional many-to-many)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_staff (
  site_id TEXT NOT NULL REFERENCES sites(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (site_id, user_id)
);

-- ---------------------------------------------------------------------------
-- EVENTS — one activation instance (kích hoạt cấp độ) per QĐ.03 flow
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,     -- uuid
  code         TEXT UNIQUE,          -- 'PCLB-2026-BAVI' | 'CTR-2026-NN'
  type         TEXT NOT NULL,        -- 'storm' | 'fire' | 'flood' | 'drill' | 'other'
  name         TEXT NOT NULL,
  level        INTEGER NOT NULL REFERENCES levels(k),
  scenario_id  TEXT REFERENCES scenarios(id),
  wind_speed   TEXT,                 -- optional storm param (as string, e.g. 'cấp 10-12')
  hours        INTEGER,              -- planned duration hours
  status       TEXT NOT NULL DEFAULT 'active',  -- active | deactivated | drill
  activated_by TEXT REFERENCES users(id),
  activated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deactivated_by TEXT REFERENCES users(id),
  deactivated_at TEXT,
  idempotency_key TEXT UNIQUE,       -- dedup POST /events/activate
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_level ON events(level);

-- ---------------------------------------------------------------------------
-- TASKS — runtime task instances dispatched under an event (from task_templates
-- or ad-hoc). Status flow: issued -> ack -> doing -> done (+ overdue/blocked)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id              TEXT PRIMARY KEY,     -- uuid
  code            TEXT UNIQUE,          -- 'TSK-0001'
  event_id        TEXT NOT NULL REFERENCES events(id),
  template_id     TEXT REFERENCES task_templates(id),
  unit_code       TEXT REFERENCES units(code),
  owner_id        TEXT REFERENCES users(id),
  checker_id      TEXT REFERENCES users(id),
  title           TEXT NOT NULL,
  description     TEXT,
  phase_id        TEXT REFERENCES phases(id),
  deadline        TEXT,                 -- ISO datetime
  status          TEXT NOT NULL DEFAULT 'issued',  -- issued|ack|doing|done|overdue|blocked
  progress        INTEGER NOT NULL DEFAULT 0,      -- 0..100
  note            TEXT,
  level            INTEGER,             -- level at time of dispatch (denormalized)
  ack_at          TEXT,
  done_at         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tasks_event ON tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_unit ON tasks(unit_code);

-- Multi-unit tasks (task.unitAll[] in prototype)
CREATE TABLE IF NOT EXISTS task_units (
  task_id   TEXT NOT NULL REFERENCES tasks(id),
  unit_code TEXT NOT NULL REFERENCES units(code),
  PRIMARY KEY (task_id, unit_code)
);

-- Task evidence (photos/files uploaded on "done", stored in R2)
CREATE TABLE IF NOT EXISTS task_evidence (
  id          TEXT PRIMARY KEY,   -- uuid
  task_id     TEXT NOT NULL REFERENCES tasks(id),
  kind        TEXT NOT NULL,      -- 'photo' | 'file'
  r2_key      TEXT NOT NULL,
  uploaded_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_task_evidence_task ON task_evidence(task_id);

-- ---------------------------------------------------------------------------
-- INCIDENTS — ad-hoc emergency reports that may auto-create an Event + tasks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
  id           TEXT PRIMARY KEY,   -- uuid
  type         TEXT NOT NULL,      -- 'fire' | 'flood' | 'accident' | 'other'
  site_id      TEXT REFERENCES sites(id),
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'open',   -- open | resolved
  resolution   TEXT,
  event_id     TEXT REFERENCES events(id),     -- linked auto-generated event
  reported_by  TEXT REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_incidents_site ON incidents(site_id);

-- ---------------------------------------------------------------------------
-- EVENT LOGS — nhật ký sự kiện (chat-like log per event, distinct from audit)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_logs (
  id         TEXT PRIMARY KEY,   -- uuid
  event_id   TEXT NOT NULL REFERENCES events(id),
  author_id  TEXT REFERENCES users(id),
  level      TEXT DEFAULT 'info',  -- info | warn | critical
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_event_logs_event ON event_logs(event_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,   -- uuid
  user_id     TEXT NOT NULL REFERENCES users(id),
  kind        TEXT NOT NULL,      -- 'task' | 'event' | 'system' | 'chat' | ...
  title       TEXT NOT NULL,
  body        TEXT,
  ref_type    TEXT,               -- 'task' | 'event' | 'incident' ...
  ref_id      TEXT,
  read_at     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id         TEXT PRIMARY KEY,   -- uuid
  user_id    TEXT NOT NULL REFERENCES users(id),
  channel    TEXT NOT NULL,      -- 'zalo' | 'sms' | 'web-push'
  token      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- AUDIT LOG — immutable per QĐ.03 Điều 78 (no DELETE endpoint exposed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,    -- uuid
  actor_id    TEXT REFERENCES users(id),
  action      TEXT NOT NULL,       -- create|update|delete|approve|assign|activate|login|export
  object_label TEXT,               -- human-readable object description
  object_type TEXT,                -- table/entity name
  object_id   TEXT,                -- FK to entity (free text, polymorphic)
  detail      TEXT,
  before_json TEXT,                -- JSON snapshot before
  after_json  TEXT,                -- JSON snapshot after
  ip          TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ---------------------------------------------------------------------------
-- SYSTEM CONFIG (Admin) — single-row key/value-ish config, kept as JSON blob
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_config (
  id          INTEGER PRIMARY KEY CHECK (id = 1),
  config_json TEXT NOT NULL DEFAULT '{}',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO system_config (id, config_json) VALUES (1, '{}');
