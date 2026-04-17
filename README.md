# EduCycle

EduCycle is a peer-to-peer marketplace for students to exchange books and study materials. The repo is a monorepo with a Spring Boot API, a React/Vite frontend, Docker-based local deployment, and optional AI chat handled server-side.

## Repo layout

```text
EDUCYCLE/
├── apps/
│   ├── api/                  # Spring Boot API
│   └── web/                  # React + Vite app
├── infra/
│   ├── docker/               # Docker and compose assets
│   ├── nginx/                # Reverse proxy configuration
│   └── scripts/              # Verification and release helpers
├── docs/
│   ├── adr/                  # Architecture decision records
│   ├── api/                  # API documentation
│   └── runbooks/             # Operational runbooks
├── docker-compose.yml       # Full stack local/prod-style compose
├── .env.example
├── README.md
└── README.vi.md
```

## Quick start with Docker

From the repo root:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Before the first run, set at least these values in `.env`:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`

Then open [http://localhost](http://localhost).

## Local development

### 1. Start PostgreSQL for backend development

```powershell
cd apps\api
docker compose up -d
```

This starts Postgres on `localhost:5433`.

### 2. Run the backend

```powershell
cd apps\api
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

The `docker` profile runs the API on `http://localhost:8081`.

### 3. Run the frontend

```powershell
cd apps/web
npm ci
npm run dev
```

The frontend runs on [http://localhost:5173](http://localhost:5173).

Notes:

- `apps/web/vite.config.js` defaults the dev proxy to `http://localhost:8081`.
- If you run the backend without the `docker` profile on port `8080`, create `apps/web/.env.local` with `VITE_DEV_PROXY_TARGET=http://localhost:8080`.

## Main features

- Email-based auth for `.edu.vn` accounts with OTP verification
- Product listing, moderation, wishlists, and public seller profiles
- Transaction flow with chat, OTP handoff confirmation, and reviews
- Book-wanted flow for request-based matching
- Admin dashboard for moderation and dispute handling
- Optional AI chat via backend proxy

## Documentation

Start here:

- [Documentation hub](docs/README.md)
- [Getting started](docs/getting-started/README.md)
- [Architecture overview](docs/architecture/README.md)
- [Backend README](apps/api/README.md)
- [Frontend README](apps/web/README.md)
- [Scripts README](infra/scripts/README.md)

Guides:

- [AI chatbot setup](docs/guides/ai-chatbot.md)
- [CI/CD auto deploy](docs/guides/cicd-auto-deploy.md)
- [Production TLS](docs/guides/production-tls.md)
- [Design reference](docs/design/README.md)

## Useful URLs

- App via Docker: `http://localhost`
- Frontend dev: `http://localhost:5173`
- Backend dev with `docker` profile: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

## Contributing

- Use `dev` as the main integration branch.
- Prefer small, focused commits.
- Use Conventional Commits.
- Stage specific files instead of `git add .`.

## License

Educational and personal project.
