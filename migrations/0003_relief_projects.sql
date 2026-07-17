-- ============================================================================
-- 0003_relief_projects.sql
-- CTG Command Center — Relief Project module (cứu trợ), fully normalized per
-- DATA-MODEL.md migration notes §10: split into relief_projects + 8 sub-tables.
-- ============================================================================

CREATE TABLE IF NOT EXISTS relief_projects (
  id               TEXT PRIMARY KEY,     -- uuid ('CTR-2026-BAVI' legacy slug kept as code)
  code             TEXT UNIQUE NOT NULL, -- 'CTR-2026-01'
  name             TEXT NOT NULL,
  disaster         TEXT NOT NULL,        -- storm|flood|drought|fire|earthquake
  disaster_label   TEXT,
  region_province  TEXT,
  region_commune   TEXT,
  region_gps       TEXT,
  status           TEXT NOT NULL DEFAULT 'drafting', -- drafting|planning|approved|in-progress|completed|closed
  status_label     TEXT,
  priority         TEXT NOT NULL DEFAULT 'medium',   -- low|medium|high|critical
  start_date       TEXT,
  end_date         TEXT,
  days             INTEGER,

  budget_total       REAL DEFAULT 0,
  budget_donation     REAL DEFAULT 0,   -- sources.donation
  budget_company       REAL DEFAULT 0,  -- sources.company
  budget_sponsor        REAL DEFAULT 0, -- sources.sponsor
  budget_spent          REAL DEFAULT 0,
  budget_committed       REAL DEFAULT 0,

  beneficiaries_households INTEGER DEFAULT 0,
  beneficiaries_people      INTEGER DEFAULT 0,

  -- outcome (only when status = completed)
  outcome_households        INTEGER,
  outcome_people             INTEGER,
  outcome_money_distributed   REAL,
  outcome_goods_value          REAL,
  outcome_lives_impacted        TEXT,
  outcome_press_coverage         TEXT,

  deleted_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_relief_projects_status ON relief_projects(status);

-- Beneficiary priority groups (relief_projects.beneficiaries.priority[] : string[])
CREATE TABLE IF NOT EXISTS relief_beneficiary_priorities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  label      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_relief_bp_project ON relief_beneficiary_priorities(project_id);

-- Individual beneficiary households (extension beyond prototype summary counts,
-- to support the documented future "beneficiary import" backlog item)
CREATE TABLE IF NOT EXISTS relief_beneficiaries (
  id           TEXT PRIMARY KEY,   -- uuid
  project_id   TEXT NOT NULL REFERENCES relief_projects(id),
  household_name TEXT,
  address        TEXT,
  people_count   INTEGER DEFAULT 1,
  priority       TEXT,
  status         TEXT DEFAULT 'pending',  -- pending|delivered|declined
  signed_at      TEXT,
  photo_url      TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_relief_beneficiaries_project ON relief_beneficiaries(project_id);

-- Team members (relief_projects.team[])
CREATE TABLE IF NOT EXISTS relief_team_members (
  id         TEXT PRIMARY KEY,     -- uuid
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  person_id  TEXT REFERENCES users(id),
  role_label TEXT,                 -- vai trò trong đoàn
  phone      TEXT
);
CREATE INDEX IF NOT EXISTS idx_relief_team_project ON relief_team_members(project_id);

-- Vehicles (relief_projects.vehicles[])
CREATE TABLE IF NOT EXISTS relief_vehicles (
  id         TEXT PRIMARY KEY,     -- uuid
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  type       TEXT,                 -- 'Xe tải 5 tấn'
  plate      TEXT,
  driver     TEXT,
  capacity   TEXT
);
CREATE INDEX IF NOT EXISTS idx_relief_vehicles_project ON relief_vehicles(project_id);

-- Cargo (relief_projects.cargo[])
CREATE TABLE IF NOT EXISTS relief_cargo (
  id         TEXT PRIMARY KEY,     -- uuid
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  item       TEXT NOT NULL,
  qty        REAL,
  unit       TEXT,
  total_label TEXT,                -- textual total, e.g. '500 bao'
  per_label   TEXT,                -- định mức: '1 bao/hộ'
  cost       REAL
);
CREATE INDEX IF NOT EXISTS idx_relief_cargo_project ON relief_cargo(project_id);

-- Itinerary (relief_projects.itinerary[])
CREATE TABLE IF NOT EXISTS relief_itinerary (
  id          TEXT PRIMARY KEY,    -- uuid
  project_id  TEXT NOT NULL REFERENCES relief_projects(id),
  day         INTEGER NOT NULL,
  date_label  TEXT,                -- 'DD/MM'
  from_label  TEXT,
  to_label    TEXT,
  distance_label TEXT,             -- '85 km'
  activities  TEXT,
  sleep_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_relief_itinerary_project ON relief_itinerary(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_relief_itinerary_day ON relief_itinerary(project_id, day);

-- Tasks scoped to a relief project (separate from main tasks table — prototype
-- models these as simple embedded rows with textual owner/deadline)
CREATE TABLE IF NOT EXISTS relief_tasks (
  id          TEXT PRIMARY KEY,    -- uuid
  project_id  TEXT NOT NULL REFERENCES relief_projects(id),
  title       TEXT NOT NULL,
  owner_id    TEXT REFERENCES users(id),
  deadline    TEXT,                -- 'YYYY-MM-DD'
  status      TEXT NOT NULL DEFAULT 'issued'  -- issued|ack|doing|done|overdue|blocked
);
CREATE INDEX IF NOT EXISTS idx_relief_tasks_project ON relief_tasks(project_id);

-- Logs (relief_projects.logs[])
CREATE TABLE IF NOT EXISTS relief_logs (
  id          TEXT PRIMARY KEY,    -- uuid
  project_id  TEXT NOT NULL REFERENCES relief_projects(id),
  author_id   TEXT REFERENCES users(id),
  message     TEXT NOT NULL,
  logged_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_relief_logs_project ON relief_logs(project_id);

CREATE TABLE IF NOT EXISTS relief_log_photos (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  log_id  TEXT NOT NULL REFERENCES relief_logs(id),
  r2_key  TEXT NOT NULL
);

-- Approvals (relief_projects.approvals: ct/tgd/congdoan/phapche each ApprovalStatus)
CREATE TABLE IF NOT EXISTS relief_approvals (
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  role       TEXT NOT NULL,   -- 'ct' | 'tgd' | 'congdoan' | 'phapche'
  decision   TEXT NOT NULL DEFAULT 'draft',  -- draft|reviewing|approved|rejected
  note       TEXT,
  decided_by TEXT REFERENCES users(id),
  decided_at TEXT,
  PRIMARY KEY (project_id, role)
);

-- Media (relief_projects.media[])
CREATE TABLE IF NOT EXISTS relief_media (
  id         TEXT PRIMARY KEY,   -- uuid
  project_id TEXT NOT NULL REFERENCES relief_projects(id),
  r2_key     TEXT NOT NULL,
  caption    TEXT,
  media_date TEXT
);
CREATE INDEX IF NOT EXISTS idx_relief_media_project ON relief_media(project_id);

-- Expenses (for budget/expenses API group)
CREATE TABLE IF NOT EXISTS relief_expenses (
  id          TEXT PRIMARY KEY,   -- uuid
  project_id  TEXT NOT NULL REFERENCES relief_projects(id),
  item        TEXT NOT NULL,
  amount      REAL NOT NULL,
  invoice_ref TEXT,
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_relief_expenses_project ON relief_expenses(project_id);

-- Reports (BC-01..06 types), generated PDF stored in R2
CREATE TABLE IF NOT EXISTS relief_reports (
  id          TEXT PRIMARY KEY,   -- uuid
  project_id  TEXT NOT NULL REFERENCES relief_projects(id),
  report_type TEXT NOT NULL,      -- 'BC-01'..'BC-06'
  r2_key      TEXT,               -- generated PDF/doc location
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_relief_reports_project ON relief_reports(project_id);
