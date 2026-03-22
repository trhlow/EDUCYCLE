# EduCycle Monorepo

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Nền tảng **P2P trao đổi sách giáo trình và tài liệu học tập** dành cho sinh viên — gồm REST API (Java 17 + Spring Boot 3.2.5) và SPA (React 19 + Vite 7).

---

## Quick Links

| Tài liệu | Mô tả |
|----------|--------|
| [Backend (Java)](source/backend/educycle-java/README.md) | API, stack, endpoint, chạy local |
| [Frontend](source/frontend/README.md) | UI, design system, tích hợp API |
| [NOTES](NOTES.md) | Trạng thái dự án, changelog (mục 7), git, prompt AI |

---

## Monorepo Structure

```
EDUCYCLE/
├── source/
│   ├── backend/educycle-java/   # Java 17 + Spring Boot 3.2.5
│   └── frontend/                # React 19 + Vite 7 SPA
├── docs/                        # Documentation
├── .github/
│   ├── workflows/               # CI/CD (ci.yml)
│   └── copilot-instructions.md
├── NOTES.md                     # Trạng thái, changelog, git, prompt AI
└── README.md
```

---

## Quick Start

**Cổng chuẩn khi dev full-stack (Docker Postgres + tránh XAMPP/Apache chiếm 8080):**

| Thành phần | URL / cổng |
|------------|------------|
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend profile **`docker`** | **http://localhost:8081** (proxy `/api` + `/ws` từ Vite trỏ vào đây) |
| Backend **mặc định** (không profile) | http://localhost:8080 |

Chi tiết: `source/backend/educycle-java/docker-compose.yml` (Postgres host **5433**), `application-docker.yml` (**8081**).  
Vite đọc `VITE_DEV_PROXY_TARGET` (mặc định trong `.env.development`: **8080**, khớp `mvn spring-boot:run` không profile). Chạy BE profile **docker** (8081) thì đặt trong `source/frontend/.env.local`: `VITE_DEV_PROXY_TARGET=http://localhost:8081`.

<table>
<tr>
<td width="50%" valign="top">

### Backend (Java 17 + Spring Boot)

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE/source/backend/educycle-java

# Khuyến nghị: Postgres Docker + profile docker (port 8081)
docker compose up -d
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

- **Default (không profile):** Postgres tại `localhost:5432`, API **8080** — xem `application.yml`
- **Profile `docker`:** Postgres `localhost:5433`, API **8081** — xem `application-docker.yml`
- Flyway chạy migration khi khởi động
- Swagger: **8080** → `http://localhost:8080/swagger-ui.html` · **docker** → `http://localhost:8081/swagger-ui.html`

</td>
<td width="50%" valign="top">

### Frontend (React 19 + Vite 7)

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE/source/frontend

npm install
npm run dev
```

- Dev server: [http://localhost:5173](http://localhost:5173)
- Proxy dev: `/api` và `/ws` → backend (mặc định **8081**, đồng bộ profile `docker`)
- Copy `.env.example` → `.env.local` nếu cần đổi cổng backend

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17 + Spring Boot 3.2.5 + Spring Security |
| **Database** | PostgreSQL 15 + Flyway migrations |
| **Auth** | JWT (JJWT 0.12.5) + Refresh Token rotation |
| **Real-time** | WebSocket STOMP + SockJS |
| **Rate Limiting** | Bucket4j 8.10.1 (per-IP) |
| **Frontend** | React 19 + Vite 7 + Axios + Context API |
| **Build (BE)** | Maven 3.9+ |
| **Build (FE)** | npm + Vite |

---

## CI/CD

Workflow GitHub Actions: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- **Trigger:** `push` và `pull_request` tới `main` và `dev`
- **Backend:** `mvn clean compile` trong `source/backend/educycle-java`
- **Frontend:** `npm ci && npm run build` trong `source/frontend`

---

## Changelog

Xem chi tiết tại **[NOTES.md — mục 7. CHANGELOG](NOTES.md#7-changelog)**.

---

## License

Đồ án / mục đích học tập — không sử dụng cho mục đích thương mại trừ khi có thỏa thuận khác.
