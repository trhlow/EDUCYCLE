# EduCycle

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)

**Tiếng Việt** · Peer-to-peer marketplace for students to exchange books & study materials · **Java + React monorepo**

**EduCycle** là nền tảng **P2P**: đăng bán tài liệu, duyệt tin, giao dịch có trạng thái, **OTP khi gặp mặt**, chat WebSocket, đánh giá uy tín, trợ lý AI (tuỳ chọn).  
Full-stack cá nhân: **Trần Hoàng Long**.

> **Note**  
> Hai cách chạy (**Docker một lệnh** vs **dev hybrid** Postgres + `mvn` + Vite) là **cố ý thiết kế** — không merge thành một flow duy nhất để vừa demo gần prod, vừa sửa code nhanh. Chi tiết pitfall: [ARCHITECTURE.md](ARCHITECTURE.md).

**Repository:** [github.com/trhlow/EDUCYCLE](https://github.com/trhlow/EDUCYCLE)

---

## Table of Contents

- [EduCycle](#educycle)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Option 1: Docker Compose (recommended for demo)](#option-1-docker-compose-recommended-for-demo)
  - [Option 2: Local development (recommended for coding)](#option-2-local-development-recommended-for-coding)
- [Access URLs](#access-urls)
- [Advanced](#advanced)
- [What EduCycle Is](#what-educycle-is)
- [Core Features](#core-features)
- [API Overview](#api-overview)
- [Transaction & OTP Flow](#transaction--otp-flow)
- [Email (SMTP)](#email-smtp)
- [AI Chatbot](#ai-chatbot)
- [Testing & CI](#testing--ci)
- [Project Layout](#project-layout)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Documentation

| Document | Purpose |
|----------|---------|
| **README.md** | *(this file)* — clone, configure, run, API summary |
| [docs/README.md](docs/README.md) | **Hub tài liệu** — mục lục `getting-started`, `architecture`, `guides` (cấu trúc gợi ý theo [deer-flow](https://github.com/bytedance/deer-flow) `docs/`) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Runtime topology, auth/WebSocket, onboarding checklist, **audit reconciliation (§10)** |
| [NOTES.md](NOTES.md) | Sprint status, changelog, FE↔BE field mapping, internal rules |
| [SETUP_CHATBOT.md](SETUP_CHATBOT.md) | AI chat — entry ngắn; chi tiết: [docs/guides/ai-chatbot.md](docs/guides/ai-chatbot.md) |
| [scripts/README.md](scripts/README.md) | Script `verify.ps1` / `verify.sh` (kiểm tra local trước push) |
| [.env.example](.env.example) | Template for root `docker-compose` (`JWT_SECRET`, optional SMTP, …) |

---

## Quick Start

### Clone the repository

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
```

### Choose your path

| Goal | Go to |
|------|--------|
| **“I want to see the app running”** (one stack, browser only) | [Option 1: Docker Compose](#option-1-docker-compose-recommended-for-demo) → open **http://localhost** |
| **“I’m developing FE/BE”** (hot reload, breakpoints) | [Option 2: Local development](#option-2-local-development-recommended-for-coding) → **5173** + **8081** |

Complete **[Configuration](#configuration)** before local dev if you use OAuth, SMTP, or AI in Docker.

---

## Configuration

### Prerequisites

- **JDK 17+**
- **Node.js 18+** (CI uses Node **20**)
- **Maven 3.9+**
- **Docker Desktop** (Postgres and/or full stack)

### Environment variables (summary)

**Do not commit** real secrets. Use [.env.example](.env.example) as a template for the **root** `docker-compose` workflow.

| Variable | Where | Purpose |
|----------|--------|---------|
| `JWT_SECRET` | Shell or `.env` next to root `docker-compose.yml` | HMAC signing for JWT (length ≥ 32) |
| `APP_FRONTEND_BASE_URL` | Docker `.env` | Links in reset-password emails (`http://localhost` in compose) |
| `ANTHROPIC_API_KEY` | Docker `api` / BE env | AI chat on **server** only (`POST /api/ai/chat`) |
| `SPRING_PROFILES_ACTIVE` | e.g. `production,smtp` | Enable real SMTP when `MAIL_*` are set |
| `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, … | `.env` + profile `smtp` | Real email — see [Email (SMTP)](#email-smtp) |
| `VITE_DEV_PROXY_TARGET` | `source/frontend/.env.local` | **8081** when BE uses Spring profile **`docker`** |
| `VITE_GOOGLE_CLIENT_ID`, `VITE_MICROSOFT_CLIENT_ID` | Frontend `.env` | OAuth; must align with backend `application.yml` |

**OAuth:** redirect URIs and client IDs must match Google Cloud / Azure app registration — see [NOTES.md](NOTES.md) (FE↔BE mapping).

**Security:** Never put Anthropic (or any LLM) **secret keys** in frontend bundles; the SPA calls the backend proxy only.

---

## Running the Application

### Option 1: Docker Compose (recommended for demo)

From the **repository root** (where `docker-compose.yml` lives):

**1) Tạo `.env` (bắt buộc cho Postgres):** sao chép [.env.example](.env.example) → `.env` và giữ hoặc đổi `POSTGRES_PASSWORD`, `JWT_SECRET`, (tuỳ chọn) `GOOGLE_CLIENT_ID` / `MICROSOFT_CLIENT_ID`. Compose **không** còn mật khẩu DB mặc định trong file YAML.

**Bash / Git Bash / macOS / Linux**

```bash
cp .env.example .env
# chỉnh POSTGRES_PASSWORD / JWT_SECRET trong .env nếu cần
docker compose up --build
```

**PowerShell (Windows)**

```powershell
Copy-Item .env.example .env
docker compose up --build
```

**What you get**

- **nginx** serves the production-built SPA and proxies **`/api`** and **`/ws`** to the API container.
- **PostgreSQL** runs on the internal Docker network only (no DB port published to the host by default).
- **Uploads** persist in volume `educycle_uploads` → `/app/data/uploads` in the API container.

Trong `.env` còn có chỗ cho `ANTHROPIC_API_KEY`, SMTP (`MAIL_*`), `GOOGLE_CLIENT_SECRET`, v.v.

### Option 2: Local development (recommended for coding)

Use this when you edit Java/React and want Vite HMR + fast iteration.

**1) PostgreSQL (host port 5433)**

```bash
cd source/backend/educycle-java
docker compose up -d
```

**2) Backend (API on 8081, uses `application-docker.yml`)**

```bash
cd source/backend/educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

**3) Frontend — set proxy target to 8081**

Create `source/frontend/.env.local` (or edit `.env.development`):

```env
VITE_DEV_PROXY_TARGET=http://localhost:8081
```

**4) Install and run Vite**

```bash
cd source/frontend
npm ci
npm run dev
```

**5) Test login**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@educycle.com` | `admin@1` |

> **Note**  
> Default Vite proxy targets **8080**. If the API runs on **8081** (profile `docker`) and you skip `VITE_DEV_PROXY_TARGET`, `/api` calls will fail or hit the wrong process.

---

## Access URLs

| Service | Docker full stack (Option 1) | Local dev (Option 2) |
|---------|------------------------------|----------------------|
| **Web app** | http://localhost (port **80**) | http://localhost:**5173** |
| **API (from host)** | Use **same origin** `/api` via nginx | http://localhost:**8081** |
| **Swagger UI** | Not exposed by default | http://localhost:8081/swagger-ui.html |
| **Postgres on host** | Not available | **localhost:5433** (only with `educycle-java/docker compose`) |

---

## Advanced

### Postgres & pgAdmin

Root `docker-compose` **does not publish** `5432/5433`. Tools like pgAdmin on `localhost:5433` need either:

- `source/backend/educycle-java/docker-compose.yml` (maps **5433:5432**), or  
- a custom `ports:` override on the `db` service, or  
- `docker exec` + `psql` inside the container.

### CORS & production

Allowed origins are listed in `application.yml` (`cors.allowed-origins`). Update them when deploying to a real domain.

### Default backend port without `docker` profile

If you run `mvn spring-boot:run` **without** the `docker` profile, the API listens on **8080** and expects Postgres on **5432**. Then use:

```env
VITE_DEV_PROXY_TARGET=http://localhost:8080
```

### Flyway

Migrations **V1–V8** are in the repo; the next file must be **`V9__....sql`**. Never edit migrations that have already been applied to a shared database.

More detail: [ARCHITECTURE.md](ARCHITECTURE.md) §8–§10.

---

## What EduCycle Is

EduCycle is a **student-to-student** marketplace: listings are moderated, deals go through explicit **transaction states**, and **face-to-face handoff** is guarded by a **buyer-generated / seller-verified OTP** — not a shopping-cart checkout flow.  
The stack is intentionally **boring and hireable**: Spring Boot, PostgreSQL, Flyway, React, and transparent REST + WebSocket contracts.

---

## Core Features

- **Auth:** Email (`.edu.vn` policy in product rules), Google, Microsoft; JWT + rotating refresh token; OTP verification for email.
- **Password:** Forgot / reset (token link); change password when logged in.
- **Listings:** CRUD, **server-side pagination** (`GET /api/products?page=&size=&direction=`), image **upload** to server disk (volume in Docker), admin approve / reject with reason.
- **Transactions:** State machine, **buyer-only OTP generate**, **seller-only OTP verify**, dispute + admin resolution.
- **Realtime:** STOMP/SockJS chat per transaction; notifications (DB + push over WS where configured).
- **Trust:** Public seller profile **`/users/:id`** backed by `GET /api/public/users/{userId}`.
- **Profile:** PATCH profile and **notification preferences** persisted on the server.
- **AI (optional):** Server-side Claude proxy — [SETUP_CHATBOT.md](SETUP_CHATBOT.md).

---

## API Overview

Base path: **`/api`**. Interactive docs: **Swagger UI** when the API is running ([Access URLs](#access-urls)).

| Area | Examples |
|------|----------|
| **Auth** | `/api/auth/login`, `register`, `refresh`, `social-login`, `forgot-password`, `reset-password`, `change-password` |
| **Users** | `GET/PATCH /api/users/me`, `PATCH .../notification-preferences` |
| **Public** | `GET /api/public/users/{userId}` |
| **Products** | `GET /api/products` (paged), `GET /api/products/{id}`, `POST /api/upload/product-image`, `GET /api/files/**` |
| **Transactions** | `POST /api/transactions`, `PATCH .../status`, `POST .../otp`, `POST .../verify-otp`, `POST .../dispute` |
| **Admin** | `GET /api/admin/transactions/disputed`, `PATCH /api/admin/transactions/{id}/resolve`, product moderation routes (see Swagger) |
| **Other** | `GET /api/categories`, `POST /api/reviews`, `GET /api/notifications`, `POST /api/ai/chat` |
| **WebSocket** | `/ws/**` (SockJS + STOMP) |

---

## Transaction & OTP Flow

```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED   (buyer, typically before OTP completion)
         ↘ REJECTED
         ↘ CANCELLED
```

1. **Buyer** calls generate OTP (enforced server-side).  
2. Buyer tells the **6-digit code** to the **seller** in person.  
3. **Seller** calls verify OTP → transaction **COMPLETED**, product **SOLD**.

---

## Email (SMTP)

Without Spring profile **`smtp`**, `MailService` **logs** email bodies — enough for local demos (OTP visible in API logs).

For real delivery:

1. Activate profile **`smtp`** and set `MAIL_*` (see `source/backend/educycle-java/src/main/resources/application-smtp.yml`).  
2. Gmail: [App Passwords](https://support.google.com/accounts/answer/185833).  
3. Docker: set `SPRING_PROFILES_ACTIVE=production,smtp` and mail variables in `.env` (see [.env.example](.env.example) comments).  
   Do **not** set empty `MAIL_HOST` if you are not using SMTP (avoids broken Spring mail auto-config).

---

## AI Chatbot

Configure **`ANTHROPIC_API_KEY`** on the **API** process (Docker or local). The browser talks only to **`POST /api/ai/chat`**.  
Full steps: [SETUP_CHATBOT.md](SETUP_CHATBOT.md).

---

## Testing & CI

Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

| Job | Command |
|-----|---------|
| Backend | `mvn -f source/backend/educycle-java/pom.xml clean verify` |
| Frontend | `npm ci` → `npm run typecheck` → `npm test` → `npm run build` in `source/frontend` |
| E2E | `npx playwright install --with-deps chromium` → `npm run test:e2e` in `source/frontend` (job riêng trên CI) |

Triggers: **push** and **pull_request** to `main` and `dev`.

Local sanity check before push:

```bash
# Bash / Git Bash / Linux / macOS
bash scripts/verify.sh
```

```powershell
# Windows PowerShell (repo root)
.\scripts\verify.ps1
```

Hoặc thủ công: `mvn -f source/backend/educycle-java/pom.xml clean verify` rồi `npm run typecheck` + `npm run build` trong `source/frontend`.

---

## Project Layout

```
EDUCYCLE/
├── source/
│   ├── backend/educycle-java/    # Spring Boot API, Flyway
│   └── frontend/                 # Vite + React (+ TS entry)
├── docs/                         # Hub tài liệu theo mục (getting-started, architecture, guides, …)
├── scripts/                      # verify.ps1 / verify.sh — kiểm tra BE+FE local
├── docker-compose.yml            # db + api + nginx (production-style)
├── .github/workflows/ci.yml
├── .env.example
├── ARCHITECTURE.md
├── NOTES.md
├── SETUP_CHATBOT.md
└── README.md
```

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| API | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Flyway |
| Auth | JWT (JJWT), refresh token (SecureRandom), OAuth token verification (Google / Microsoft) |
| DB | PostgreSQL 16 |
| Realtime | WebSocket STOMP + SockJS |
| Rate limiting | Bucket4j (IP-based); separate in-memory limiter for AI chat |
| SPA | React 19, Vite 7, React Router 7, Axios |
| OAuth clients | @react-oauth/google, @azure/msal-browser |
| Build | Maven, npm |
| Deploy artifact | Docker multi-stage images + Compose |

---

## Contributing

- Primary branch: **`dev`**; releases merge to **`main`**.  
- Use [Conventional Commits](https://www.conventionalcommits.org/) — see [NOTES.md](NOTES.md) §4 (format + **một commit = một lĩnh vực**, không gộp nhiều domain không liên quan).  
- Prefer **`git add <file>`** over `git add .`.

---

## License

Educational / personal project — not for commercial use without separate agreement.

---

## Acknowledgments

Built with **Spring Boot**, **React**, **PostgreSQL**, and the broader open-source ecosystem. OAuth and AI integrations rely on provider APIs documented in [NOTES.md](NOTES.md) and [SETUP_CHATBOT.md](SETUP_CHATBOT.md).

**Author:** Trần Hoàng Long
