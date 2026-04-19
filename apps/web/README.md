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

- `config/vite.config.js` proxies `/api` and `/ws` to `http://localhost:8081`
- if the backend runs on `8080`, add `VITE_DEV_PROXY_TARGET=http://localhost:8080` to `.env.local`

## Main folders

| Path | Purpose |
|------|---------|
| `config/` | Tooling, test, deployment, and formatting configuration |
| `src/app/` | App shell, route groups, root layout, router, and providers |
| `src/app/(auth)/` | Auth route group |
| `src/app/(dashboard)/` | Protected app route group |
| `src/app/api/` | Reserved BFF route-handler boundary for future backend-for-frontend work |
| `src/app/router/` | React Router composition and route guards |
| `src/app/providers/` | Root provider stack |
| `src/components/ui/` | Shared UI primitives |
| `src/components/forms/` | Shared form components |
| `src/components/layouts/` | Layout and navigation components |
| `src/components/` | Shared UI, form, layout, system, and non-domain widgets |
| `src/context/` | Existing app-level contexts during migration |
| `src/features/` | Feature-owned API facades, schemas, hooks, routes, pages, and private components |
| `src/lib/` | API client, endpoint wrappers, query client, schemas, and utilities |
| `src/hooks/` | Shared custom React hooks that are not owned by one feature |
| `src/pages/` | App/system pages only, such as 404 during the migration |
| `src/stores/` | Reserved global store boundary |
| `src/styles/` | Shared styling tokens and CSS |
| `src/types/` | Shared type declarations |
| `tests/unit/` | Vitest unit tests |
| `tests/integration/` | Testing Library integration tests |
| `tests/e2e/` | Playwright tests |

## Main routes

V1 frontend scope is intentionally narrow. Keep the core marketplace loop:

- auth
- listing
- transaction
- review
- minimal profile
- admin lite

Defer book-wanted, standalone inquiry chat, secondary static/support screens, cart, wishlist as a route, dashboard as a route, and broad UI redesign.

`src/App.tsx` is now only the app shell entry. Route ownership lives in feature route modules under `src/features/*/routes/*.routes.jsx`, and `src/app/router/routes.jsx` only composes public, private, and admin-only route groups. Each V1 feature now has explicit `api/`, `components/`, `hooks/`, `schemas/`, `routes/`, and `pages/` boundaries. This remains a React/Vite app, so there is no fake `next.config.ts` or `tailwind.config.ts` until the stack actually migrates to Next.js or Tailwind. The FE-1 target route map and sitemap decisions are documented in [Frontend V1 route map](docs/frontend-v1-route-map.md).

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
