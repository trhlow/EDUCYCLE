-- Sprint 3: moderation reason + user notification preferences

ALTER TABLE products
    ADD COLUMN reject_reason TEXT;

ALTER TABLE users
    ADD COLUMN notify_product_moderation BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users
    ADD COLUMN notify_transactions BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users
    ADD COLUMN notify_messages BOOLEAN NOT NULL DEFAULT TRUE;
