CREATE TABLE IF NOT EXISTS review_migration_archive (
    archive_id UUID NOT NULL DEFAULT gen_random_uuid(),
    original_review_id UUID NOT NULL,
    user_id UUID,
    product_id UUID,
    target_user_id UUID,
    transaction_id UUID,
    rating INTEGER,
    content TEXT,
    created_at TIMESTAMPTZ,
    archive_reason VARCHAR(80) NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_review_migration_archive PRIMARY KEY (archive_id)
);

INSERT INTO review_migration_archive (
    original_review_id,
    user_id,
    product_id,
    target_user_id,
    transaction_id,
    rating,
    content,
    created_at,
    archive_reason
)
SELECT
    r.id,
    r.user_id,
    r.product_id,
    r.target_user_id,
    r.transaction_id,
    r.rating,
    r.content,
    r.created_at,
    'orphan_transaction'
FROM reviews r
WHERE r.transaction_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM transactions t
      WHERE t.id = r.transaction_id
  );

DELETE FROM reviews r
WHERE r.transaction_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM transactions t
      WHERE t.id = r.transaction_id
  );

WITH ranked_reviews AS (
    SELECT
        r.*,
        ROW_NUMBER() OVER (
            PARTITION BY transaction_id, user_id, target_user_id
            ORDER BY created_at DESC, id DESC
        ) AS rn
    FROM reviews r
    WHERE transaction_id IS NOT NULL
      AND user_id IS NOT NULL
      AND target_user_id IS NOT NULL
)
INSERT INTO review_migration_archive (
    original_review_id,
    user_id,
    product_id,
    target_user_id,
    transaction_id,
    rating,
    content,
    created_at,
    archive_reason
)
SELECT
    rr.id,
    rr.user_id,
    rr.product_id,
    rr.target_user_id,
    rr.transaction_id,
    rr.rating,
    rr.content,
    rr.created_at,
    'duplicate_transaction_reviewer_target'
FROM ranked_reviews rr
WHERE rr.rn > 1;

WITH ranked_reviews AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY transaction_id, user_id, target_user_id
            ORDER BY created_at DESC, id DESC
        ) AS rn
    FROM reviews
    WHERE transaction_id IS NOT NULL
      AND user_id IS NOT NULL
      AND target_user_id IS NOT NULL
)
DELETE FROM reviews r
USING ranked_reviews rr
WHERE r.id = rr.id
  AND rr.rn > 1;

ALTER TABLE reviews
    ADD CONSTRAINT uq_reviews_transaction_reviewer_target
        UNIQUE (transaction_id, user_id, target_user_id);

ALTER TABLE reviews
    ADD CONSTRAINT fk_reviews_transaction
        FOREIGN KEY (transaction_id) REFERENCES transactions (id);

CREATE INDEX IF NOT EXISTS idx_transactions_status_disputed_at
    ON transactions (status, disputed_at DESC);
