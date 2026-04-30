-- Align username values with application rule: trim + lower-case for uniqueness semantics.
-- Resolve collisions after normalization (same pattern as V3).
-- Runtime username policy caps normalized usernames at 50 chars.

WITH ranked AS (
    SELECT u.id,
           LOWER(TRIM(u.username)) AS norm,
           ROW_NUMBER() OVER (
               PARTITION BY LOWER(TRIM(u.username))
               ORDER BY u.created_at ASC, u.id ASC
           ) AS rn
    FROM users u
)
UPDATE users u
SET username = CASE
    WHEN LENGTH(r.norm) >= 3 AND r.rn = 1 THEN LEFT(r.norm, 50)
    WHEN LENGTH(r.norm) >= 3 THEN LEFT(r.norm, 41) || '_' || LEFT(REPLACE(u.id::text, '-', ''), 8)
    ELSE 'user_' || LEFT(REPLACE(u.id::text, '-', ''), 8)
END
FROM ranked r
WHERE u.id = r.id;
