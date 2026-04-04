-- Indexes for common filters (Principal Engineer audit §6.4)
CREATE INDEX IF NOT EXISTS idx_products_status ON products (status);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products (user_id);
