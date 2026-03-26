-- V12__security_improvements.sql
-- Security hardening:
--   1. Add previous_refresh_token column for refresh-token replay-attack detection.
--   2. Invalidate all existing refresh tokens so that every session is re-established
--      using the new hashed-storage scheme introduced in this sprint.

-- 1. Replay-detection: keep hash of the previous refresh token in the same row.
ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_refresh_token TEXT;

-- 2. Invalidate all current refresh tokens.
--    Users will simply be prompted to log in again, which will store the token
--    as a SHA-256 hash going forward.
UPDATE users SET
    refresh_token        = NULL,
    refresh_token_expiry = NULL,
    refresh_token_family = NULL,
    previous_refresh_token = NULL;
