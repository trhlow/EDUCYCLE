---
name: backend-review
description: Review or improve Java Spring Boot backend code, including controllers, services, repositories, DTOs, validation, transactions, and tests.
---

# Backend Review Skill

Use this skill when working on Java Spring Boot backend code.

## Review Checklist

1. Architecture
   - Controllers only handle HTTP concerns.
   - Services contain business logic.
   - Repositories contain persistence logic.
   - DTOs are used for external API boundaries.
   - Entities are not leaked unnecessarily.

2. API Correctness
   - Endpoints use proper HTTP methods.
   - Status codes are meaningful.
   - Validation errors are clear.
   - Pagination is used for list endpoints.
   - Request and response models are stable.

3. Business Logic
   - Rules are implemented in service layer.
   - Edge cases are handled.
   - Null handling is safe.
   - Duplicate logic is avoided.

4. Persistence
   - Transactions are used for write operations.
   - Queries avoid N+1 problems.
   - Index needs are considered.
   - Relationships are modeled carefully.

5. Testing
   - Service tests cover business rules.
   - Controller tests cover validation and response codes.
   - Repository tests cover custom queries.
   - Security-sensitive behavior is tested.

## Output Format

Return:

1. Summary
2. P0/P1/P2/P3 issues
3. Suggested changes
4. Test recommendations
5. Final verdict
