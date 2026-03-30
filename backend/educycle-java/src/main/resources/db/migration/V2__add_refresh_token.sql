-- Refresh token (opaque) + expiry for rotation-based session extension

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(200),
    ADD COLUMN IF NOT EXISTS refresh_token_expiry TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_refresh_token
    ON users(refresh_token) WHERE refresh_token IS NOT NULL;
