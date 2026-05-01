-- Align username values with application rule: trim + lower-case, 3..50 chars, unique.
-- Collisions are detected after truncation, because different raw usernames may share the
-- same first 50 normalized characters.

WITH normalized AS (
    SELECT
        u.id,
        u.created_at,
        LOWER(TRIM(COALESCE(u.username, ''))) AS norm
    FROM users u
),
base AS (
    SELECT
        n.id,
        n.created_at,
        CASE
            WHEN LENGTH(n.norm) >= 3 THEN LEFT(n.norm, 50)
            ELSE 'user_' || LEFT(MD5(n.id::text), 12)
        END AS candidate,
        LENGTH(n.norm) > 50 OR LENGTH(n.norm) < 3 AS force_suffix
    FROM normalized n
),
candidate_ranked AS (
    SELECT
        b.*,
        COUNT(*) OVER (PARTITION BY b.candidate) AS candidate_count
    FROM base b
),
suffixed AS (
    SELECT
        cr.id,
        cr.created_at,
        CASE
            WHEN NOT cr.force_suffix AND cr.candidate_count = 1 THEN cr.candidate
            ELSE LEFT(cr.candidate, 37) || '_' || LEFT(MD5(cr.id::text), 12)
        END AS candidate
    FROM candidate_ranked cr
),
final_ranked AS (
    SELECT
        s.*,
        COUNT(*) OVER (PARTITION BY s.candidate) AS final_count,
        ROW_NUMBER() OVER (PARTITION BY s.candidate ORDER BY s.created_at ASC, s.id ASC) AS final_rn
    FROM suffixed s
),
finalized AS (
    SELECT
        fr.id,
        CASE
            WHEN fr.final_count = 1 THEN fr.candidate
            ELSE LEFT(fr.candidate, 45) || '_' || LPAD(fr.final_rn::text, 4, '0')
        END AS final_username
    FROM final_ranked fr
)
UPDATE users u
SET username = f.final_username
FROM finalized f
WHERE u.id = f.id;
