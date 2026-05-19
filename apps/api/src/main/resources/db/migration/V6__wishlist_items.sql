-- Wishlist persistence for the product wishlist API.
-- Forward-only migration; V1 intentionally excluded wishlist from the baseline.

CREATE TABLE wishlist_items (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL,
    product_id UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_wishlist_items PRIMARY KEY (id),
    CONSTRAINT fk_wishlist_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_product
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX idx_wishlist_items_user_created_at
    ON wishlist_items (user_id, created_at DESC);

CREATE INDEX idx_wishlist_items_product
    ON wishlist_items (product_id);
