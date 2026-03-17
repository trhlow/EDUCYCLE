-- =============================================================
-- V1__initial_schema.sql
-- EduCycle – Flyway migration (converted from EF Core migrations)
-- Target DB: PostgreSQL
--
-- Replaces all C# EF Core Migrations (20260210 → 20260219)
-- Enum values stored as VARCHAR to match EF Core HasConversion<string>()
-- =============================================================

-- =====================
-- EXTENSION
-- =====================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- =====================
-- USERS
-- =====================
CREATE TABLE users (
    id                              UUID        NOT NULL DEFAULT gen_random_uuid(),
    username                        VARCHAR(100) NOT NULL,
    email                           VARCHAR(200) NOT NULL,
    password_hash                   TEXT         NOT NULL,
    role                            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    avatar                          TEXT,
    bio                             TEXT,
    created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- OAuth fields (added in 20260217160000 / 20260219051534)
    google_id                       VARCHAR(200),
    facebook_id                     VARCHAR(200),
    microsoft_id                    VARCHAR(200),

    -- Email verification (added in 20260217160000)
    is_email_verified               BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verification_token        TEXT,
    email_verification_token_expiry TIMESTAMPTZ,

    -- Password reset
    password_reset_token            TEXT,
    password_reset_token_expiry     TIMESTAMPTZ,

    -- Phone (added in 20260218065603)
    phone                           VARCHAR(20),
    phone_verified                  BOOLEAN      NOT NULL DEFAULT FALSE,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- =====================
-- CATEGORIES
-- =====================
CREATE TABLE categories (
    id   SERIAL       NOT NULL,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT pk_categories PRIMARY KEY (id)
);

-- =====================
-- PRODUCTS
-- =====================
CREATE TABLE products (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    price        NUMERIC(18, 2) NOT NULL,
    image_url    TEXT,
    image_urls   TEXT,              -- JSON array of image URLs
    category     VARCHAR(100),
    condition    VARCHAR(100),
    contact_note TEXT,
    category_id  INTEGER,           -- nullable FK → categories
    user_id      UUID         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT fk_product_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT chk_products_status
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SOLD'))
);

-- =====================
-- TRANSACTIONS
-- =====================
CREATE TABLE transactions (
    id               UUID          NOT NULL DEFAULT gen_random_uuid(),
    product_id       UUID          NOT NULL,
    buyer_id         UUID          NOT NULL,
    seller_id        UUID          NOT NULL,
    amount           NUMERIC(18, 2) NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    otp_code         VARCHAR(10),
    otp_expires_at   TIMESTAMPTZ,
    buyer_confirmed  BOOLEAN       NOT NULL DEFAULT FALSE,
    seller_confirmed BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_transactions PRIMARY KEY (id),
    CONSTRAINT fk_transaction_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_transaction_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_transaction_seller
        FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT chk_transactions_status
        CHECK (status IN ('PENDING','ACCEPTED','MEETING','COMPLETED',
                          'AUTO_COMPLETED','REJECTED','CANCELLED','DISPUTED'))
);

-- =====================
-- REVIEWS
-- =====================
CREATE TABLE reviews (
    id             UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id        UUID        NOT NULL,
    product_id     UUID,           -- nullable (product review)
    target_user_id UUID,           -- nullable (user-to-user review)
    transaction_id UUID,           -- nullable reference (not enforced FK)
    rating         INTEGER     NOT NULL,
    content        TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_reviews PRIMARY KEY (id),
    CONSTRAINT fk_review_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_review_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_target_user
        FOREIGN KEY (target_user_id) REFERENCES users(id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
);

-- =====================
-- MESSAGES
-- =====================
CREATE TABLE messages (
    id             UUID        NOT NULL DEFAULT gen_random_uuid(),
    transaction_id UUID        NOT NULL,
    sender_id      UUID        NOT NULL,
    content        TEXT        NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT fk_message_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- =====================
-- INDEXES (performance)
-- =====================
CREATE INDEX idx_products_status       ON products(status);
CREATE INDEX idx_products_user_id      ON products(user_id);
CREATE INDEX idx_transactions_buyer    ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller   ON transactions(seller_id);
CREATE INDEX idx_transactions_product  ON transactions(product_id);
CREATE INDEX idx_reviews_product       ON reviews(product_id);
CREATE INDEX idx_reviews_target_user   ON reviews(target_user_id);
CREATE INDEX idx_messages_transaction  ON messages(transaction_id);

-- =====================
-- SEED DATA
-- =====================

-- Admin user (password: admin@1, BCrypt cost 11)
-- Hash is identical to C# BCrypt.Net-Next — format compatible
INSERT INTO users (
    id, username, email, password_hash, role,
    is_email_verified, phone_verified, created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@educycle.com',
    '$2a$11$vI8aWBnW3fID.ixJCRy.qOhMkGh/.WY6g9E7KO0OLfZNPq9i0jq9y',
    'ADMIN',
    TRUE, FALSE,
    '2025-01-01 00:00:00+00'
) ON CONFLICT (id) DO NOTHING;

-- Seed Categories (matches C# HasData in ApplicationDbContext)
INSERT INTO categories (id, name) VALUES
    (1, 'Giáo Trình'),
    (2, 'Sách Chuyên Ngành'),
    (3, 'Tài Liệu Ôn Thi'),
    (4, 'Dụng Cụ Học Tập'),
    (5, 'Ngoại Ngữ'),
    (6, 'Khác')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid collisions after manual ID inserts
SELECT setval('categories_id_seq', 6, true);
