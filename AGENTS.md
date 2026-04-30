# EDUCYCLE Agent Instructions

## Project Context

EDUCYCLE is an education-oriented full-stack project. The backend is primarily Java Spring Boot. The frontend may use a modern JavaScript framework such as Vue/Vite or equivalent. The project must prioritize maintainability, security, clean architecture, and production-readiness.

The agent must not make large architectural changes without explaining the reason. Prefer small, reviewable commits and clear task boundaries.

## Working Principles

- Always inspect existing code before editing.
- Do not invent files, packages, APIs, entities, or business rules that are not present or requested.
- Prefer improving existing structure over rewriting everything blindly.
- Keep changes minimal, testable, and consistent with the current codebase.
- Explain trade-offs when choosing between alternatives.
- If a requirement is ambiguous, make the safest reasonable assumption and document it.
- Never hardcode secrets, tokens, API keys, passwords, or private URLs.
- Do not remove validation, authorization, logging, or tests unless replacing them with a better implementation.

## Backend Rules

- Use Java 21+ style when supported by the project.
- Follow Spring Boot conventions.
- Keep controller, service, repository, DTO, mapper, config, and security responsibilities separated.
- Controllers must not contain business logic.
- Services must not directly expose persistence entities to external clients unless the existing project already does so and the task is explicitly small.
- Prefer DTOs for request and response models.
- Validate input using Bean Validation where appropriate.
- Use constructor injection.
- Avoid field injection.
- Avoid returning raw exceptions to clients.
- Use consistent error response format.
- Use transactions at service layer for write operations.
- Do not create circular dependencies.
- Avoid N+1 query problems.
- Use pagination for list endpoints.

## Security Rules

- Every endpoint must have clear authentication and authorization behavior.
- Public endpoints must be explicitly justified.
- Never trust client-provided userId for ownership-sensitive operations.
- Use server-side authenticated principal whenever possible.
- Do not put JWT secrets or OAuth secrets in source code.
- Validate CORS configuration.
- Validate file uploads by size, MIME type, extension, and storage path.
- Do not log sensitive data.
- Avoid exposing stack traces in API responses.
- Use least privilege for roles.

## Database Rules

- Schema changes must be explicit and migration-friendly.
- Avoid destructive changes unless clearly requested.
- Use indexes for frequently queried columns.
- Preserve referential integrity.
- Use clear naming for tables, columns, constraints, and indexes.
- Avoid storing computed values unless there is a clear performance or audit reason.
- Prefer timestamps for createdAt and updatedAt.
- Soft delete should be considered for user-facing records.

## Frontend Rules

- Keep UI components small and reusable.
- Separate API clients, hooks/composables, pages, layouts, and shared components.
- Do not put business logic directly inside UI markup.
- Handle loading, empty, error, and success states.
- Validate forms on client side, but never rely only on client-side validation.
- Avoid duplicated API calls.
- Keep responsive design mobile-first.
- Use accessible labels, semantic HTML, keyboard navigation, and proper contrast.

## Testing Rules

- Add or update tests when changing business logic.
- Backend tests should cover service logic, controller behavior, repository queries, and security-sensitive flows where relevant.
- Frontend tests should cover critical user flows and form behavior where relevant.
- If tests cannot be run, explain why and list the exact command that should be run manually.

## Review Output Format

When reviewing or changing code, respond with:

1. Summary
2. Files changed
3. Main reasoning
4. Risks
5. Tests run
6. Next recommended step

For code review, classify issues as:

- P0: critical, must fix immediately
- P1: high priority
- P2: medium priority
- P3: cleanup or improvement

## Commands

Before finalizing backend changes, prefer running:

```bash
./mvnw test
./mvnw spring-boot:run
```

If Maven wrapper does not exist:

```bash
mvn test
mvn spring-boot:run
```

Before finalizing frontend changes, prefer running:

```bash
npm install
npm run lint
npm run test
npm run build
```

Only run commands that exist in the project.
