ALTER TABLE transactions
    ADD COLUMN dispute_reason TEXT;

ALTER TABLE transactions
    ADD COLUMN disputed_at TIMESTAMPTZ;
