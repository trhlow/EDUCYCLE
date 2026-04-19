-- =============================================================================
-- Xóa toàn bộ dữ liệu nghiệp vụ + mọi tài khoản user; chỉ giữ admin seed
-- admin@educycle.com (mật khẩu mặc định xem README / V5 migration).
-- PostgreSQL (EduCycle). Không đụng bảng flyway_schema_history.
--
-- Chạy (Docker backend compose — port 5433):
--   set PGPASSWORD=<local-db-password>
--   psql -h localhost -p 5433 -U educycle -d educycledb -v ON_ERROR_STOP=1 -f scripts/wipe-db-keep-admin.sql
--
-- Hoặc: docker compose exec -T db psql -U educycle -d educycledb -v ON_ERROR_STOP=1 < scripts/wipe-db-keep-admin.sql
-- =============================================================================

BEGIN;

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*)::int INTO n
  FROM users
  WHERE lower(trim(email)) = 'admin@educycle.com';
  IF n < 1 THEN
    RAISE EXCEPTION 'Không có user admin@educycle.com — dừng (cần seed admin hoặc tạo tay trước khi chạy).';
  END IF;
END $$;

DELETE FROM wishlist_items;
DELETE FROM messages;
DELETE FROM transactions;
DELETE FROM reviews;
DELETE FROM notifications;
DELETE FROM book_wanted_posts;
DELETE FROM products;

TRUNCATE TABLE ai_knowledge_chunk;
TRUNCATE TABLE categories RESTART IDENTITY;

DELETE FROM users
WHERE lower(trim(email)) IS DISTINCT FROM 'admin@educycle.com';

UPDATE users
SET role = 'ADMIN',
    refresh_token = NULL,
    refresh_token_expiry = NULL,
    refresh_token_family = NULL,
    password_reset_token = NULL,
    password_reset_token_expiry = NULL,
    email_verification_token = NULL,
    email_verification_token_expiry = NULL,
    transaction_rules_accepted_at = NULL
WHERE lower(trim(email)) = 'admin@educycle.com';

COMMIT;
