-- ============================================================================
-- 0004_support_modules.sql
-- CTG Command Center — Supporting modules referenced in API-CONTRACT.md /
-- UI-GUIDE.md: Cameras, Chat, Weather cache, Generic file uploads, Config
-- backups. These back Phase-2/3 optional integrations (camera tile, chat
-- widget, weather auto-activation) — tables are created now so the schema is
-- complete; actual external integrations (Zalo OA, NCHMF weather, RTSP/HLS
-- proxy) are implemented later per the phased plan.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CAMERAS — site camera registry (HLS/RTSP proxy metadata only; no video
-- storage/processing happens on Cloudflare Workers itself)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cameras (
  id          TEXT PRIMARY KEY,   -- uuid
  site_id     TEXT REFERENCES sites(id),
  name        TEXT,
  stream_url  TEXT,
  hls_url     TEXT,
  status      TEXT DEFAULT 'offline',  -- online|offline|error
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cameras_site ON cameras(site_id);

CREATE TABLE IF NOT EXISTS camera_snapshots (
  id         TEXT PRIMARY KEY,   -- uuid
  camera_id  TEXT NOT NULL REFERENCES cameras(id),
  r2_key     TEXT NOT NULL,
  taken_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- CHAT — channels (Ban chỉ huy / per-project / per-event) + messages
-- Realtime delivery via polling in Phase 1 (5-10s), Durable Objects later.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_channels (
  id          TEXT PRIMARY KEY,   -- uuid
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'general',  -- general|event|relief_project
  ref_type    TEXT,               -- 'event' | 'relief_project' when scoped
  ref_id      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,   -- uuid
  channel_id  TEXT NOT NULL REFERENCES chat_channels(id),
  author_id   TEXT REFERENCES users(id),
  text        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at);

CREATE TABLE IF NOT EXISTS chat_message_attachments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id  TEXT NOT NULL REFERENCES chat_messages(id),
  r2_key      TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- AI ASSISTANT — lightweight log of assistant calls (for audit / rate limit)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_conversations (
  id          TEXT PRIMARY KEY,   -- uuid
  user_id     TEXT REFERENCES users(id),
  context     TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id              TEXT PRIMARY KEY,  -- uuid
  conversation_id TEXT NOT NULL REFERENCES ai_conversations(id),
  role            TEXT NOT NULL,     -- 'user' | 'assistant' | 'system'
  content         TEXT,
  tokens          INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- WEATHER CACHE — server-side proxy cache for NCHMF / Open-Meteo (avoid CORS,
-- reduce upstream calls; feeds Phase-3 auto level-activation trigger)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weather_cache (
  id          TEXT PRIMARY KEY,   -- uuid
  lat         REAL NOT NULL,
  lng         REAL NOT NULL,
  payload_json TEXT NOT NULL,     -- raw upstream response
  fetched_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires ON weather_cache(expires_at);

-- ---------------------------------------------------------------------------
-- GENERIC FILE UPLOADS — R2-backed, generic (used where a specific evidence/
-- media table doesn't already cover the use case)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS uploads (
  id          TEXT PRIMARY KEY,   -- uuid
  r2_key      TEXT NOT NULL,
  mime        TEXT,
  size        INTEGER,
  uploaded_by TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- CONFIG BACKUPS — record of on-demand D1 export snapshots (actual SQL dump
-- lives in R2; this table tracks metadata / history)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS config_backups (
  id          TEXT PRIMARY KEY,   -- uuid
  r2_key      TEXT,
  created_by  TEXT REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  note        TEXT
);
