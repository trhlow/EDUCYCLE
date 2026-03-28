-- Giao dịch (mua/bán) chỉ với email .edu.vn; OAuth Gmail/Microsoft vẫn đăng nhập được (trading_allowed = false).
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS trading_allowed BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE users
SET trading_allowed = (trim(lower(email)) ~ '\.edu\.vn$');

-- Tin "tìm sách" — người cần mua / tìm tài liệu đăng nhu cầu, người có sách có thể xem hồ sơ công khai để liên hệ.
CREATE TABLE book_wanted_posts (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL,
    title        VARCHAR(300) NOT NULL,
    description  TEXT,
    category     VARCHAR(150),
    status       VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_book_wanted_posts PRIMARY KEY (id),
    CONSTRAINT fk_book_wanted_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT chk_book_wanted_status
        CHECK (status IN ('OPEN', 'CLOSED'))
);

CREATE INDEX idx_book_wanted_status_created ON book_wanted_posts (status, created_at DESC);
CREATE INDEX idx_book_wanted_user_created ON book_wanted_posts (user_id, created_at DESC);
