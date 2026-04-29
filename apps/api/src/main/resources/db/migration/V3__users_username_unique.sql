-- Enforce unique usernames at DB level (application-layer checks alone cannot prevent races).

WITH ranked AS (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY username
               ORDER BY created_at ASC, id ASC
           ) AS rn
    FROM users
)
UPDATE users u
SET username = LEFT(u.username, 63) || '_' || REPLACE(u.id::text, '-', '')
FROM ranked r
WHERE u.id = r.id
  AND r.rn > 1;

ALTER TABLE users
    ADD CONSTRAINT uq_users_username UNIQUE (username);
