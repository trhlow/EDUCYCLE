-- Align username values with application rule: trim + lower-case for uniqueness semantics.
-- Resolve collisions after normalization (same pattern as V3).

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
    WHEN r.rn = 1 THEN r.norm
    ELSE LEFT(r.norm, 63) || '_' || REPLACE(u.id::text, '-', '')
END
FROM ranked r
WHERE u.id = r.id;
