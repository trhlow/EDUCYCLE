<div align="center">

# EduCycle

A **peer-to-peer marketplace** for students to exchange books and study materials — with moderated listings, transaction states, **OTP at handoff**, realtime chat, and optional AI.

**Stack:** Java 26 · Spring Boot 4.0.5 · PostgreSQL · React 19 · Vite 8 · Docker

[![Java](https://img.shields.io/badge/Java-26-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Educational%2Fpersonal-9B59B6)](#license)

**🇻🇳 [Tiếng Việt → README.vi.md](README.vi.md)**

[Documentation hub](docs/README.md) · [Architecture](docs/ARCHITECTURE.md) · [Run with Docker](#docker-quick-start) · [Local dev](#local-dev) · [API overview](#api-overview) · [Contributing](#contributing)

**Repository:** [github.com/trhlow/EDUCYCLE](https://github.com/trhlow/EDUCYCLE) · **Author:** Trần Hoàng Long

</div>

---

## 📖 Table of contents

- [What is this?](#what-is-this)
- [Documentation](#documentation)
- [Self-hosting](#self-hosting)
- [Configuration](#configuration)
- [Access URLs](#access-urls)
- [Advanced](#advanced)
- [Core features](#core-features)
- [API overview](#api-overview)
- [Email (SMTP)](#email-smtp)
- [AI chatbot](#ai-chatbot)
- [Testing & CI](#testing-ci)
- [Project layout](#project-layout)
- [Tech stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

<a id="what-is-this"></a>
## ❓ What is this?

EduCycle is a **student-to-student** marketplace. Listings are moderated, deals follow explicit **transaction states**, and **in-person handoff** uses a **buyer-generated / seller-verified OTP** — not a classic shopping-cart checkout. The codebase is a **monorepo**: Spring Boot API + React SPA, with REST and WebSocket contracts you can read in Swagger.

| Browse | Deep dives |
|--------|------------|
| [docs/README.md](docs/README.md) — doc hub | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime, auth, WS, audit (section 10) |
| [docs/NOTES.md](docs/NOTES.md) — sprint, FE↔BE mapping | [docs/guides/](docs/guides/) — TLS, AI chatbot, Git/Cursor, … |
| [.env.example](.env.example) — Docker env template | [scripts/README.md](scripts/README.md) — `verify` scripts |

> **Design note:** Two ways to run (**one-command Docker** vs **hybrid dev**: Postgres + `mvn` + Vite) are **intentional** — demo-close-to-prod *and* fast local iteration. Pitfalls: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

<a id="documentation"></a>
## 📚 Documentation

Start at [docs/README.md](docs/README.md) for the full index (`getting-started`, architecture, guides). This **README.md** is the default English front door: clone, configure, run, and a concise API map. Vietnamese: [README.vi.md](README.vi.md).

| Document | Purpose |
|----------|---------|
| [docs/README.md](docs/README.md) | Documentation hub |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Topology, auth/WebSocket, checklist |
| [docs/NOTES.md](docs/NOTES.md) | Status, changelog, internal rules |
| [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md) | AI chat — entry |
| [docs/guides/ai-chatbot.md](docs/guides/ai-chatbot.md) | AI — details |

---

<a id="self-hosting"></a>
<a id="running-the-application"></a>
## 🚀 Self-hosting

<a id="docker-quick-start"></a>
<a id="option-1-docker-compose-recommended-for-demo"></a>
### Quick start: Docker

From the **repo root** (where `docker-compose.yml` lives), copy env and bring the stack up. Nginx serves the built SPA and proxies `/api` and `/ws` to the API. Postgres runs on the internal network (no DB port on the host by default).

**Bash / Git Bash / macOS / Linux**

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
cp .env.example .env
# edit POSTGRES_PASSWORD, JWT_SECRET in .env
docker compose up --build
```

**PowerShell (Windows)**

```powershell
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
Copy-Item .env.example .env
docker compose up --build
```

Then open **http://localhost** (nginx on port **80**).

→ Full pitfalls (pgAdmin, DB ports): [Advanced](#advanced).

---

<a id="local-dev"></a>
<a id="option-2-local-development-recommended-for-coding"></a>
### Manual setup: local development

Use this when you want Vite HMR and Java breakpoints. Start Postgres on **5433**, API on **8081** with Spring profile **`docker`**, point Vite proxy at **8081**, then `npm run dev`.

**1) PostgreSQL (host port 5433)**

```bash
cd backend/educycle-java
docker compose up -d
```

**2) Backend (API on 8081)**

```bash
cd backend/educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

**3) Frontend — proxy target**

Create `frontend/.env.local` (or `.env.development`):

```env
VITE_DEV_PROXY_TARGET=http://localhost:8081
```

**4) Install and run Vite**

```bash
cd frontend
npm ci
npm run dev
```

**5) Test login**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@educycle.com` | `admin@1` |

> Default Vite proxy targets **8080**. If the API uses **8081** (`docker` profile) and you skip `VITE_DEV_PROXY_TARGET`, `/api` calls will fail.

---

<a id="configuration"></a>
## ⚙️ Configuration

### Prerequisites

JDK **26+**, Node **24+** (CI uses Node **24**), Maven **3.9+**, Docker Desktop (optional but recommended).

### Environment variables (summary)

Do **not** commit secrets. Use [.env.example](.env.example) for the **root** `docker-compose` workflow.

| Variable | Where | Purpose |
|----------|--------|---------|
| `JWT_SECRET` | `.env` at repo root | JWT HMAC (length ≥ 32) |
| `APP_FRONTEND_BASE_URL` | Docker `.env` | Links in emails |
| `ANTHROPIC_API_KEY` | API container / BE | Server-only AI (`POST /api/ai/chat`) |
| `SPRING_PROFILES_ACTIVE` | e.g. `production,smtp` | Real SMTP when `MAIL_*` set |
| `MAIL_*` | `.env` + `smtp` profile | Outbound email |
| `VITE_DEV_PROXY_TARGET` | `frontend/.env.local` | Use **8081** when BE runs profile **`docker`** |

**OAuth:** Redirect URIs and client IDs must match Google Cloud / Azure registration — see [docs/NOTES.md](docs/NOTES.md).

**Security:** Never put LLM **API keys** in the frontend bundle; the SPA calls the backend proxy only.

---

<a id="access-urls"></a>
## 🔗 Access URLs

| Service | Docker full stack | Local dev |
|---------|-------------------|-----------|
| **Web app** | http://localhost (**80**) | http://localhost:**5173** |
| **API (host)** | Same origin `/api` via nginx | http://localhost:**8081** |
| **Swagger UI** | Not exposed by default | http://localhost:8081/swagger-ui.html |
| **Postgres on host** | Not published by default | **localhost:5433** (backend module compose) |

---

<a id="advanced"></a>
## 🧩 Advanced

**Postgres & pgAdmin:** Root `docker-compose` does not publish `5432/5433`. Use `backend/educycle-java/docker-compose.yml`, override `ports:` on `db`, or `docker exec` + `psql`.

**CORS:** Allowed origins live in `application.yml` (`cors.allowed-origins`). Update for real domains.

**API on 8080:** `mvn spring-boot:run` **without** `docker` profile → API **8080**, Postgres **5432**. Then:

```env
VITE_DEV_PROXY_TARGET=http://localhost:8080
```

**Flyway:** Migrations **V1–V16** are in the repo; the next file must be **`V17__....sql`**. Never edit migrations already applied on a shared DB. More: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

<a id="core-features"></a>
## ⭐ Core features

- **Auth:** `.edu.vn` registration with OTP before first login; login accepts verified emails (incl. admin). JWT + rotating refresh token.
- **Password:** Forgot / reset (token link); change when logged in.
- **Listings:** CRUD, server-side pagination, image upload (disk / Docker volume), admin approve/reject with reason.
- **Transactions:** State machine; buyer generates OTP, seller verifies; dispute + admin resolution.
- **Realtime:** STOMP/SockJS chat per transaction; notifications (DB + WS where configured).
- **Trust:** Public seller profile `/users/:id` via `GET /api/public/users/{userId}`.
- **Profile:** PATCH profile and notification preferences on the server.
- **AI (optional):** Server-side Claude proxy — [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md).

---

<a id="api-overview"></a>
## 🔌 API overview

Base path **`/api`**. Interactive docs: **Swagger UI** when the API is running.

| Area | Examples |
|------|----------|
| **Auth** | `/api/auth/login`, `register`, `verify-otp`, `refresh`, `forgot-password`, `reset-password`, `change-password` |
| **Users** | `GET/PATCH /api/users/me`, `PATCH .../notification-preferences` |
| **Public** | `GET /api/public/users/{userId}` |
| **Products** | `GET /api/products` (paged), `GET /api/products/{id}`, `POST /api/upload/product-image`, `GET /api/files/**` |
| **Transactions** | `POST /api/transactions`, `PATCH .../status`, `POST .../otp`, `POST .../verify-otp`, `POST .../dispute` |
| **Admin** | Disputed transactions, product moderation (see Swagger) |
| **Other** | `GET /api/categories`, `POST /api/reviews`, `GET /api/notifications`, `POST /api/ai/chat` |
| **WebSocket** | `/ws/**` (SockJS + STOMP) |

### Transaction flow

```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED
         ↘ REJECTED
         ↘ CANCELLED
```

1. Buyer generates OTP (server-enforced).  
2. Buyer tells the **6-digit** code to the seller in person.  
3. Seller verifies → **COMPLETED**, product **SOLD**.

---

<a id="email-smtp"></a>
## ✉️ Email (SMTP)

Without profile **`smtp`**, `MailService` **logs** email bodies (fine for local demos — OTP visible in API logs). For real mail: activate **`smtp`**, set `MAIL_*` (see `application-smtp.yml`), use Gmail App Passwords if applicable, and in Docker set `SPRING_PROFILES_ACTIVE=production,smtp`. Do **not** set empty `MAIL_HOST` if you are not using SMTP.

---

<a id="ai-chatbot"></a>
## 🤖 AI chatbot

Set **`ANTHROPIC_API_KEY`** on the **API** process only. The browser calls **`POST /api/ai/chat`**. Steps: [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md).

---

<a id="testing-ci"></a>
<a id="testing--ci"></a>
## 🧪 Testing & CI

**Workflow:** [.github/workflows/ci.yml](.github/workflows/ci.yml) — triggers on **push** and **pull_request** to **`main`** and **`dev`**.

| Job | Command |
|-----|---------|
| Backend | `mvn -f backend/educycle-java/pom.xml clean verify` |
| Frontend | `npm ci` → `npm run typecheck` → `npm test` → `npm run build` in `frontend` |
| E2E | Playwright in `frontend` (see workflow) |

**Local verify**

```bash
bash scripts/verify.sh
```

```powershell
.\scripts\verify.ps1
```

---

<a id="project-layout"></a>
## 📁 Project layout

Root keeps **runnable code**, **compose**, **README** files, and **version** — long-form docs live under **`docs/`** (SaaS-style monorepo).

```
EDUCYCLE/
├── backend/educycle-java/   # API (Spring Boot, Flyway)
├── frontend/                # SPA (Vite + React)
├── docs/                    # Architecture, NOTES, guides, design, …
├── scripts/                 # verify.sh / verify.ps1, release helpers
├── VERSION
├── docker-compose.yml
├── .github/workflows/
├── .env.example
├── README.md                # English (default on GitHub)
└── README.vi.md             # Tiếng Việt
```

---

## 🛠️ Tech stack

| Layer | Technologies |
|-------|----------------|
| API | Java 26, Spring Boot 4.0.5, Spring Security, JPA, Flyway |
| Auth | JWT (JJWT), refresh token (SecureRandom), `.edu.vn` + email OTP |
| DB | PostgreSQL 18 |
| Realtime | STOMP + SockJS |
| Rate limiting | Bucket4j; separate limiter for AI chat |
| SPA | React 19, Vite 8, React Router 7, Axios, TanStack Query |
| Build | Maven, npm |
| Deploy | Docker multi-stage + Compose |

---

<a id="contributing"></a>
## 🤝 Contributing

Primary branch **`dev`**; releases merge to **`main`**. Use [Conventional Commits](https://www.conventionalcommits.org/) — format and **one commit = one domain** in [docs/NOTES.md](docs/NOTES.md) (section 4). Prefer **`git add <file>`** over `git add .`.

---

<a id="license"></a>
## 📄 License

Educational / personal project — not for commercial use without separate agreement.

---

## 🙏 Acknowledgments

Built with **Spring Boot**, **React**, **PostgreSQL**, and the open-source ecosystem. Optional AI: [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md) and [docs/NOTES.md](docs/NOTES.md).
