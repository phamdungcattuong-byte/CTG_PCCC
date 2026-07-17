-- ============================================================================
-- 0001_reference_data.sql
-- CTG Command Center — Reference / config tables (rarely change at runtime)
-- Units, Roles, Levels, Phases, Sites, Task Templates, Scenarios, Norms,
-- QĐ.03 reference tables (forms, principles, forbidden, resp matrix, cost),
-- Inventory reference (PCCC, GAPS), Relief logistics reference,
-- Phonebook / benchmark / fire-steps / food tables.
-- All idempotent (CREATE TABLE IF NOT EXISTS) so it can be re-applied safely.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- UNITS — 14 org units (BCH, CT, TN, ECO, CTN, NHAM, CTSYP, TTDY, QLN, VP, MKT, VPCT, IT, PC)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  code        TEXT PRIMARY KEY,      -- 'CT', 'TN', 'ECO', ...
  name        TEXT NOT NULL,
  short       TEXT NOT NULL,
  icon        TEXT,
  parent_code TEXT REFERENCES units(code),
  sort_order  INTEGER DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- ROLES — 8-role RBAC (super, bch, unit_head, relief, warehouse, duty, audit, viewer)
-- perms stored as JSON array of permission strings, e.g. ["view.all","activate"] or ["*"]
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,      -- 'super' | 'bch' | 'unit_head' | ...
  name        TEXT NOT NULL,
  description TEXT,
  color       TEXT,                  -- CSS gradient class, e.g. 'grad-a'
  perms_json  TEXT NOT NULL DEFAULT '[]',   -- JSON array of permission strings
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fine-grained permission catalogue (for future ACL UI / validation; role.perms_json
-- references these codes as free strings for now per DATA-MODEL.md notes)
CREATE TABLE IF NOT EXISTS permissions (
  code        TEXT PRIMARY KEY,      -- 'view.all', 'activate', 'assign.tasks', ...
  resource    TEXT,
  action      TEXT,
  description TEXT
);

-- ---------------------------------------------------------------------------
-- LEVELS — 5 fixed operational levels per QĐ.03 (0..4 = XANH/VÀNG/CAM/ĐỎ/ĐẶC BIỆT)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS levels (
  k        INTEGER PRIMARY KEY,      -- 0..4
  code     TEXT NOT NULL,            -- 'XANH' | 'VÀNG' | 'CAM' | 'ĐỎ' | 'ĐẶC BIỆT'
  qd       TEXT,                     -- 'Cấp X – Y'
  name     TEXT NOT NULL,
  cls      TEXT,                     -- CSS class 'lv0'..'lv4'
  trigger_desc TEXT,                 -- điều kiện kích hoạt
  action_desc  TEXT,                 -- hành động chính
  auth_desc    TEXT,                 -- thẩm quyền quyết định (Điều 8 QĐ.03)
  eoc      TEXT,                     -- mức kích hoạt EOC
  hk       TEXT                      -- tín hiệu HK tương đương (bão)
);

-- ---------------------------------------------------------------------------
-- PHASES — 14 response phases (DAILY, RP, RD, RA, T72..T6, DUR, R0..R7, ADHOC)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phases (
  id    TEXT PRIMARY KEY,   -- 'DAILY' | 'RP' | 'RD' | 'RA' | 'T72' | ... | 'ADHOC'
  label TEXT NOT NULL,
  sub   TEXT,
  rel   TEXT,               -- 'DAILY' | 'ACT' | 'T0' — mốc tham chiếu
  off_hours INTEGER         -- offset giờ (âm = trước, dương = sau)
);

-- Level <-> Phase applicability (many-to-many)
CREATE TABLE IF NOT EXISTS level_phases (
  level_k  INTEGER NOT NULL REFERENCES levels(k),
  phase_id TEXT NOT NULL REFERENCES phases(id),
  PRIMARY KEY (level_k, phase_id)
);

-- ---------------------------------------------------------------------------
-- SITES — 11 physical sites (construction / residential / hospitality / warehouse)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
  id         TEXT PRIMARY KEY,       -- 'HIJKL', 'OPQRT', 'KHO_TT', ...
  name       TEXT NOT NULL,
  unit_code  TEXT REFERENCES units(code),
  x          REAL,                   -- % position on schematic map (0-100)
  y          REAL,
  kind       TEXT,                   -- construction | residential | hospitality | warehouse
  staff      INTEGER DEFAULT 0,
  risk       TEXT DEFAULT 'ok',       -- ok | warn | crit
  description TEXT,
  latitude   REAL,
  longitude  REAL,
  address    TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- TASK TEMPLATES — 208-item task library, keyed by unit/phase/min_level
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS task_templates (
  id                TEXT PRIMARY KEY,   -- uuid
  code              TEXT UNIQUE,        -- 'TT-0001'
  unit_code         TEXT REFERENCES units(code),
  phase_id          TEXT REFERENCES phases(id),
  min_level         INTEGER NOT NULL DEFAULT 0,
  title             TEXT NOT NULL,
  suggested_owner   TEXT,               -- free-text role/person hint from prototype
  suggested_checker TEXT,
  note              TEXT,
  active            INTEGER NOT NULL DEFAULT 1,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_task_templates_unit ON task_templates(unit_code);
CREATE INDEX IF NOT EXISTS idx_task_templates_phase ON task_templates(phase_id);

-- ---------------------------------------------------------------------------
-- SCENARIOS — 10 response scenarios (6 Bão B1-B6 + 4 Cháy C1-C4)
-- (README says "11" — verified extraction shows 10; README count is outdated)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scenarios (
  id     TEXT PRIMARY KEY,     -- 'KB-B1' .. 'KB-C4'
  grp    TEXT NOT NULL,        -- 'B' (Bão) | 'C' (Cháy)
  lv     INTEGER NOT NULL,     -- cấp độ áp dụng 1..4
  name   TEXT NOT NULL,
  trigger_desc TEXT,
  assumption   TEXT,
  force_desc   TEXT,
  sla    TEXT,
  drill  TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scenario_actions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL REFERENCES scenarios(id),
  seq         INTEGER NOT NULL,
  action_text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scenario_actions_scenario ON scenario_actions(scenario_id);

-- ---------------------------------------------------------------------------
-- NORMS_V7 — 15 supply norm rows (định mức vật tư theo đơn vị)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS norms (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,      -- 'A. Bảo hộ cá nhân'
  name     TEXT NOT NULL,
  unit     TEXT,                -- ĐVT
  tn       REAL,                -- định mức Thống Nhất
  cty      REAL,                -- định mức Công ty
  eco      REAL,
  ctn      REAL,
  note     TEXT
);

-- ---------------------------------------------------------------------------
-- PCCC_INV — 27 fire-equipment inventory rows
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pccc_inventory (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  unit     TEXT,
  tn       TEXT,     -- may be numeric or 'Có' text in source
  cty      TEXT,
  eco      TEXT,
  ctn      TEXT,
  note     TEXT,
  alert    INTEGER NOT NULL DEFAULT 0   -- 1 = problem (thiếu/hỏng/hết HSD)
);

-- ---------------------------------------------------------------------------
-- GAPS — 12 inventory gap / issue rows (priority P1-P3)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_gaps (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  priority  TEXT NOT NULL,     -- 'P1' | 'P2' | 'P3'
  unit_code TEXT,              -- informal label in source data (e.g. 'Kho cứu trợ'),
                                -- not always a formal units.code — no FK on purpose
  item      TEXT NOT NULL,
  qty       TEXT,
  issue     TEXT,
  action    TEXT,
  flag      INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- COST_STRUCT — 7 cost categories (01..07)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cost_struct (
  code        TEXT PRIMARY KEY,   -- '01'..'07'
  name        TEXT NOT NULL,
  description TEXT,
  evidence    TEXT,               -- chứng từ yêu cầu
  approver    TEXT                -- thẩm quyền duyệt
);

-- ---------------------------------------------------------------------------
-- RESP_MATRIX — 12 responsibility-matrix rows
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resp_matrix (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  role_title   TEXT NOT NULL,
  responsibility TEXT,
  output_desc  TEXT
);

-- ---------------------------------------------------------------------------
-- Warehouse tier model (5 rows) + Group-level stock (10 rows)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kho_model (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  tier     TEXT NOT NULL,       -- '1. Kho TỔNG (Group)'
  manager  TEXT,
  content  TEXT
);

CREATE TABLE IF NOT EXISTS group_store (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  item  TEXT NOT NULL,
  unit  TEXT,
  qty   REAL,
  note  TEXT
);

-- ---------------------------------------------------------------------------
-- RELIEF_LEVELS — 4 relief activation levels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relief_levels (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  name      TEXT NOT NULL,     -- 'Cấp 1 – Hỗ trợ nhanh'
  condition_desc TEXT,
  sla       TEXT,
  authority TEXT
);

-- ---------------------------------------------------------------------------
-- BENCH — 8 benchmark comparison rows
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bench (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  org      TEXT NOT NULL,      -- 'EVN / EVNNPC'
  practice TEXT,
  lesson   TEXT
);

-- ---------------------------------------------------------------------------
-- FIRE_STEPS — 5-step fire response procedure
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fire_steps (
  step        INTEGER PRIMARY KEY,   -- 1..5
  title       TEXT NOT NULL,
  description TEXT,
  sla         TEXT
);

-- ---------------------------------------------------------------------------
-- FOOD_ITEMS (5) / FOOD_UNITS (5) — relief food supply reference
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_items (
  k        TEXT PRIMARY KEY,   -- 'mi'
  name     TEXT NOT NULL,
  unit     TEXT,
  per_day  REAL,
  price    REAL
);

CREATE TABLE IF NOT EXISTS food_units (
  unit_code TEXT PRIMARY KEY,   -- includes informal labels like 'PKT' (Đội kỹ thuật QLN),
                                 -- not always a formal units.code — no FK on purpose
  name      TEXT NOT NULL,
  staff     INTEGER
);

-- ---------------------------------------------------------------------------
-- PHONEBOOK — 77 contact rows
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS phonebook (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  title       TEXT,
  description TEXT,
  unit_code   TEXT REFERENCES units(code),
  group_name  TEXT,
  phone       TEXT
);

-- ---------------------------------------------------------------------------
-- QD03_PRINCIPLES (6) / QD03_FORBIDDEN (6) / QD03_FORMS (13)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qd03_principles (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qd03_forbidden (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qd03_forms (
  code  TEXT PRIMARY KEY,   -- 'BM-PCLB-01'
  name  TEXT NOT NULL,
  owner TEXT                -- người/chức danh quản lý form
);
