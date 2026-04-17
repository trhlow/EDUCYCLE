# EduCycle Frontend

Frontend application for EduCycle, built with React and Vite.

## Stack

- React 19
- Vite 8
- React Router
- Axios
- TanStack Query
- STOMP/SockJS
- CSS tokens in `src/styles/`

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run test:e2e
npm run test:e2e:api
```

## Environment

Useful apps/web env vars:

- `VITE_DEV_PROXY_TARGET` to change the dev proxy target
- `VITE_API_BASE_URL` for direct API calls when needed
- `VITE_ENABLE_UNSPLASH_HERO` for the optional hero image feature

Default dev proxy behavior:

- `vite.config.js` proxies `/api` and `/ws` to `http://localhost:8081`
- if the backend runs on `8080`, add `VITE_DEV_PROXY_TARGET=http://localhost:8080` to `.env.local`

## Main folders

| Path | Purpose |
|------|---------|
| `src/api/` | API client and endpoint wrappers |
| `src/components/` | Reusable UI and layout components |
| `src/contexts/` | Auth and other app-level contexts |
| `src/features/` | Feature-level UI logic |
| `src/pages/` | Route pages |
| `src/providers/` | Query and app providers |
| `src/styles/` | Shared styling tokens and CSS |
| `src/test/` | Frontend tests |
| `e2e/` | Playwright tests |

## Main routes

The app currently includes flows for:

- auth
- product listing and product detail
- post/edit product
- transactions and transaction detail
- wishlist, profile, dashboard, admin
- public user profiles
- book-wanted listing, detail, create/edit, mine, and inquiry chat

Route definitions live in `src/App.jsx`.

## Running locally

```powershell
cd apps/web
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Related docs

- [Root README](../README.md)
- [Documentation hub](../docs/README.md)
- [Architecture overview](../docs/architecture/README.md)
