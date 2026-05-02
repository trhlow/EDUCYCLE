DELETE FROM reviews r
WHERE r.transaction_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM transactions t
      WHERE t.id = r.transaction_id
  );

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
