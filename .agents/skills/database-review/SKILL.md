---
name: database-review
description: Review database schema, JPA entities, relationships, indexes, migrations, transactions, and query performance.
---

# Database Review Skill

Use this skill when reviewing schema, SQL, JPA entities, repositories, migrations, or performance.

## Checklist

1. Schema
   - Tables have clear names.
   - Primary keys are stable.
   - Foreign keys are explicit.
   - Constraints protect data integrity.
   - Nullable columns are intentional.

2. JPA
   - Entity relationships are not over-eager.
   - Fetch strategies are considered.
   - Cascades are safe.
   - equals/hashCode are not dangerous.
   - Lazy loading issues are considered.

3. Queries
   - Avoid N+1.
   - Use pagination.
   - Add indexes for frequent filters.
   - Avoid fetching unnecessary columns.
   - Avoid slow wildcard search unless indexed appropriately.

4. Migrations
   - Changes are reversible where possible.
   - Destructive changes are flagged.
   - Default values are safe.
   - Existing data compatibility is considered.

5. Transactions
   - Write operations are transactional.
   - Transaction boundaries are at service layer.
   - External calls are not inside transactions.

## Output Format

Return:

1. Data model risks
2. Query risks
3. Migration risks
4. Recommended indexes
5. Safe refactor plan
