---
name: security-review
description: Review authentication, authorization, token handling, secrets, CORS, CSRF, validation, file upload, and sensitive data exposure.
---

# Security Review Skill

Use this skill for security-sensitive code or review tasks.

## Security Checklist

1. Authentication
   - Protected endpoints require authentication.
   - Token validation is strict.
   - Expired and invalid tokens are rejected.
   - Refresh token flow is safe.

2. Authorization
   - User ownership is checked server-side.
   - Roles and permissions are enforced.
   - Admin routes are not accessible by normal users.
   - Client-provided userId is not trusted.

3. Secrets
   - No secrets in source code.
   - No secrets in frontend bundles.
   - No tokens in logs.
   - Environment variables are used correctly.

4. Input Validation
   - Request body validation exists.
   - Path/query params are validated.
   - File upload is constrained.
   - SQL/NoSQL injection risks are checked.

5. Web Security
   - CORS is narrow.
   - CSRF is handled when cookie auth is used.
   - Sensitive errors are not exposed.
   - Stack traces are hidden.

## Output Format

Classify issues:

- P0: exploitable immediately
- P1: serious security risk
- P2: moderate security weakness
- P3: hardening recommendation

Always explain how to fix the issue safely.
