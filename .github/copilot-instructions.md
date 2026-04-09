# EduCycle Copilot Instructions

## Project structure

- Backend: `backend/educycle-java/`
- Frontend: `frontend/`
- Shared docs: `docs/`
- Deployment files: `deploy/`

## Current conventions

- The frontend compares backend statuses in uppercase form.
- Frontend styling should use tokens from `frontend/src/styles/`.
- Backend database changes use new Flyway migrations; do not edit old applied migrations.
- Prefer small, focused commits and stage specific files instead of `git add .`.

## Before changing code

- Read the relevant module README first.
- For project-wide context, start at `docs/README.md`.
- For runtime behavior, read `docs/architecture/README.md`.

## Useful commands

```powershell
# Backend
cd backend\educycle-java
mvn clean verify

# Frontend
cd frontend
npm ci
npm run typecheck
npm run test
npm run build
```
