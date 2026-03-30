ALTER TABLE transactions
    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE transactions SET updated_at = created_at WHERE updated_at IS NULL;
