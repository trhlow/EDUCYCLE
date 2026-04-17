# Architecture

This document is the current architecture overview for EduCycle. Use it as the high-level source of truth for how the app is structured and how the main runtime modes work.

## System overview

EduCycle is a monorepo with:

- a Spring Boot API in `backend/educycle-java/`
- a React/Vite SPA in `frontend/`
- PostgreSQL as the main database
- optional Redis support for selected backend features
- Docker-based local and deployment workflows

The Backend V1 contract uses REST under `/api`. WebSocket traffic under `/ws` is outside the default V1 runtime scope.

## Runtime modes

| Mode | Frontend | Backend | Database |
|------|----------|---------|----------|
| Local development | Vite on `5173` | Spring Boot on `8081` with profile `docker` | Postgres on `5433` from `backend/educycle-java/docker-compose.yml` |
| Full stack Docker | nginx on `80` | Containerized API behind nginx | Postgres inside root compose |
| Deployment | Reverse proxy / edge TLS | Containerized API | Managed or self-hosted Postgres |

## Key application flows

### Authentication

- Registration is email-based for `.edu.vn` accounts.
- The backend sends an OTP for verification.
- `verify-otp` completes the initial verification flow.
- Authenticated requests use JWT issued by the backend.

### Marketplace and transactions

- Users can create and manage product listings.
- Admins moderate listings and disputes.
- Transactions include chat, status transitions, and OTP handoff confirmation.
- Reviews and public user profiles support trust signals.

### Book wanted flow

- Users can publish requests for books they want.
- Other users can respond and continue the discussion through inquiry chat.
- This flow is outside the default Backend V1 contract and is not included in the V1 baseline migration.

### AI chat

- The frontend never stores provider keys.
- The browser calls backend endpoints only.
- Optional RAG content is loaded from backend resources.
- This flow is outside the default Backend V1 contract and is not included in the V1 baseline migration.

## Main code areas

| Area | Location |
|------|----------|
| Backend controllers and services | `backend/educycle-java/src/main/java/com/educycle/` |
| Backend config and resources | `backend/educycle-java/src/main/resources/` |
| Frontend routes and pages | `frontend/src/App.jsx`, `frontend/src/pages/` |
| Frontend API client | `frontend/src/api/` |
| Frontend state and providers | `frontend/src/contexts/`, `frontend/src/providers/` |
| Deployment compose | `docker-compose.yml`, `deploy/docker-compose.deploy.yml` |

## Related docs

- [Getting started](../getting-started/README.md)
- [Backend README](../../backend/educycle-java/README.md)
- [Frontend README](../../frontend/README.md)
- [AI chatbot guide](../guides/ai-chatbot.md)
- [Backend V1 ERD](backend-v1-erd.md)
- [Production TLS guide](../guides/production-tls.md)
- [Transaction redesign note](transaction-redesign-2026.md)
