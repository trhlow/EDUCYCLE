-- Hủy giao dịch: lý do + thời điểm; gộp MEETING → ACCEPTED (OTP mở trực tiếp từ ACCEPTED)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

UPDATE transactions SET status = 'ACCEPTED' WHERE status = 'MEETING';

CREATE INDEX IF NOT EXISTS idx_transactions_status_updated_at ON transactions (status, updated_at)
    WHERE status IN ('PENDING', 'ACCEPTED');
