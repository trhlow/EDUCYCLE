ALTER TABLE reviews
    ADD CONSTRAINT uq_reviews_transaction_reviewer_target
        UNIQUE (transaction_id, user_id, target_user_id);
