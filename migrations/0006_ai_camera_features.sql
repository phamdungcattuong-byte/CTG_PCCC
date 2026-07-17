-- ============================================================================
-- 0006_ai_camera_features.sql
-- CTG Command Center — Phase-2 features:
--  1) AI Assistant — persist chat turns for audit (real LLM backend now wired,
--     see src/routes/ai.ts). No schema change needed for chat itself beyond
--     a lightweight log table.
--  2) Camera Security Subsystem — live-feed viewing for chung cư (apartment
--     sites) and công trường (construction sites), backed by a per-camera
--     stream URL registry (HLS .m3u8 or embeddable iframe URL from the
--     vendor's cloud CCTV platform — e.g. Hikvision Hik-Connect, EZVIZ,
--     Dahua DMSS, etc.). Cloudflare Workers itself never decodes/relays the
--     video stream — the browser plays it directly (hls.js) or embeds the
--     vendor's own player (iframe), which is the only approach compatible
--     with the Workers "no heavy compute / no long-running process" limits.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extend `cameras` (created in 0004) with the fields needed for real
-- live-feed playback + zone classification (chung cư vs công trường) +
-- vendor bookkeeping. SQLite ALTER TABLE only supports single ADD COLUMN
-- per statement, so each new column is its own statement.
-- ---------------------------------------------------------------------------
ALTER TABLE cameras ADD COLUMN embed_url   TEXT;             -- iframe/player URL from vendor cloud platform (preferred when set)
ALTER TABLE cameras ADD COLUMN kind        TEXT NOT NULL DEFAULT 'construction'; -- 'residential' (chung cư) | 'construction' (công trường)
ALTER TABLE cameras ADD COLUMN vendor      TEXT;             -- 'hikvision' | 'ezviz' | 'dahua' | 'other'
ALTER TABLE cameras ADD COLUMN location_note TEXT;           -- 'Sảnh A - tầng 1', 'Cổng chính', ...
ALTER TABLE cameras ADD COLUMN sort_order  INTEGER NOT NULL DEFAULT 0;
ALTER TABLE cameras ADD COLUMN created_by  TEXT REFERENCES users(id);

-- ---------------------------------------------------------------------------
-- CAMERA ALERTS — security incidents/notes logged against a camera+zone
-- (manual flag by duty staff while watching a feed; not automated video
-- analytics, which is out of scope on Cloudflare Workers).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS camera_alerts (
  id          TEXT PRIMARY KEY,   -- uuid
  camera_id   TEXT NOT NULL REFERENCES cameras(id),
  raised_by   TEXT REFERENCES users(id),
  severity    TEXT NOT NULL DEFAULT 'info',  -- info|warn|crit
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',  -- open|resolved
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_camera_alerts_camera ON camera_alerts(camera_id, created_at);
CREATE INDEX IF NOT EXISTS idx_camera_alerts_status ON camera_alerts(status, created_at);

-- ---------------------------------------------------------------------------
-- AI CHAT LOGS — every AI assistant turn, for audit/QA of the real LLM
-- backend (per-user question + answer + which operational level/context
-- was sent as system prompt).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id          TEXT PRIMARY KEY,   -- uuid
  user_id     TEXT REFERENCES users(id),
  question    TEXT NOT NULL,
  answer      TEXT,
  context     TEXT,               -- json snapshot: level, eventName, etc.
  model       TEXT,
  error       TEXT,                -- set if the LLM call failed and fallback was used
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_user ON ai_chat_logs(user_id, created_at);

-- ---------------------------------------------------------------------------
-- PERMISSIONS — register the two new fine-grained permission codes used by
-- the camera subsystem's RBAC gate (role.perms_json already stores free
-- strings per DATA-MODEL.md notes; this just documents them in the catalogue).
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO permissions (code, resource, action, description) VALUES
  ('camera.view',   'camera', 'view',   'Xem live-feed camera an ninh (chung cư / công trường)'),
  ('camera.manage', 'camera', 'manage', 'Quản lý danh mục camera (thêm/sửa/xoá, cấu hình URL luồng)');

-- Grant camera.view to roles that already have broad operational visibility,
-- and camera.manage to bch/unit_head (site-level responsibility) — super
-- already has '*' so no change needed there.
UPDATE roles SET perms_json = '["view.all","activate","approve.high","camera.view","camera.manage"]'
  WHERE id = 'bch' AND perms_json NOT LIKE '%camera.view%';
UPDATE roles SET perms_json = '["view.unit","assign.tasks","report.unit","camera.view","camera.manage"]'
  WHERE id = 'unit_head' AND perms_json NOT LIKE '%camera.view%';
UPDATE roles SET perms_json = '["task.receive","log.write","camera.view"]'
  WHERE id = 'duty' AND perms_json NOT LIKE '%camera.view%';
UPDATE roles SET perms_json = '["view.all","audit.read","camera.view"]'
  WHERE id = 'audit' AND perms_json NOT LIKE '%camera.view%';
