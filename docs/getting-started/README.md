# Getting started

## Prerequisites

- Docker Desktop
- Maven
- Node.js + npm
- A recent JDK for the backend module

## Option 1: Full stack with Docker

From the repo root:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Required values in `.env`:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`

Open [http://localhost](http://localhost).

## Option 2: Local development

### Backend database

```powershell
cd apps\api
docker compose up -d
```

### Backend API

```powershell
cd apps\api
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

### Frontend app

```powershell
cd apps/web
npm ci
npm run dev
```

The default Vite proxy target is `http://localhost:8081`.  
If the backend runs on `8080`, create `apps/web/.env.local` with:

```env
VITE_DEV_PROXY_TARGET=http://localhost:8080
```

## Common URLs

- Docker app: `http://localhost`
- Frontend dev: `http://localhost:5173`
- Backend dev: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
