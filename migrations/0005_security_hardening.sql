-- ============================================================================
-- 0005_security_hardening.sql
-- Adds: (1) forced password-change flag for seeded/admin-reset accounts,
--       (2) login attempt tracking table for rate-limiting (Phase 2 item,
--           now implemented) — keyed by IP + username, sliding window
--           checked/pruned in application code (no cron needed on D1).
-- ============================================================================

ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0;

-- All 24 seeded accounts share the same default password (Cattuong@2026) —
-- force a change on first login so it can't be used long-term unnoticed.
UPDATE users SET must_change_password = 1 WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS login_attempts (
  id          TEXT PRIMARY KEY,        -- uuid
  username    TEXT NOT NULL,
  ip          TEXT,
  success     INTEGER NOT NULL,        -- 0 = failed, 1 = succeeded
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_username_time ON login_attempts(username, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip, created_at);
