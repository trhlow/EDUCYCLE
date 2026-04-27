-- Refresh tokens: previously stored plaintext. Cannot migrate to hash without the raw value — clear so users re-login.
UPDATE users
SET
    refresh_token = NULL,
    refresh_token_expiry = NULL,
    refresh_token_family = NULL
WHERE refresh_token IS NOT NULL;

-- Transaction: optimistic locking + OTP brute-force mitigation
ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS otp_failed_attempts INTEGER NOT NULL DEFAULT 0;

ALTER TABLE transactions
    ADD COLUMN IF NOT EXISTS otp_locked_until TIMESTAMPTZ;

COMMENT ON COLUMN transactions.version IS 'JPA @Version for optimistic locking';
COMMENT ON COLUMN transactions.otp_failed_attempts IS 'Consecutive failed seller OTP verifications (reset on success or new OTP)';
COMMENT ON COLUMN transactions.otp_locked_until IS 'If set and in the future, OTP verify/generate is blocked for this transaction';
