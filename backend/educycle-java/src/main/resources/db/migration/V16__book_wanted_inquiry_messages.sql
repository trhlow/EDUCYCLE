-- Hội thoại "tôi có sách" giữa người đăng tin tìm sách và người có sách (không gắn giao dịch sản phẩm).
CREATE TABLE book_wanted_inquiries (
    id                  UUID         NOT NULL DEFAULT gen_random_uuid(),
    post_id             UUID         NOT NULL,
    responder_user_id   UUID         NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_book_wanted_inquiries PRIMARY KEY (id),
    CONSTRAINT fk_bw_inquiry_post
        FOREIGN KEY (post_id) REFERENCES book_wanted_posts (id) ON DELETE CASCADE,
    CONSTRAINT fk_bw_inquiry_responder
        FOREIGN KEY (responder_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_bw_inquiry_post_responder UNIQUE (post_id, responder_user_id)
);

CREATE INDEX idx_bw_inquiry_post ON book_wanted_inquiries (post_id);
CREATE INDEX idx_bw_inquiry_responder ON book_wanted_inquiries (responder_user_id);

CREATE TABLE book_wanted_inquiry_messages (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    inquiry_id   UUID         NOT NULL,
    sender_id    UUID         NOT NULL,
    content      TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_book_wanted_inquiry_messages PRIMARY KEY (id),
    CONSTRAINT fk_bw_msg_inquiry
        FOREIGN KEY (inquiry_id) REFERENCES book_wanted_inquiries (id) ON DELETE CASCADE,
    CONSTRAINT fk_bw_msg_sender
        FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_bw_msg_inquiry_created ON book_wanted_inquiry_messages (inquiry_id, created_at);
