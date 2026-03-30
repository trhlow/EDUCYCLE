-- Thời điểm user chấp nhận nội quy giao dịch (đồng bộ server, thay localStorage)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS transaction_rules_accepted_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN users.transaction_rules_accepted_at IS 'User chấp nhận nội quy giao dịch (EduCycle)';
