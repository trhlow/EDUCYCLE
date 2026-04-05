<div align="center">

# EduCycle

Nền tảng **P2P** cho sinh viên **trao đổi sách & tài liệu** — duyệt tin, giao dịch có trạng thái, **OTP khi gặp mặt**, chat WebSocket, đánh giá uy tín, trợ lý AI (tuỳ chọn).

**Stack:** Java 26 · Spring Boot 4.0.5 · PostgreSQL · React 19 · Vite 8 · Docker

[![Java](https://img.shields.io/badge/Java-26-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Educational%2Fpersonal-9B59B6)](#license)

**🇬🇧 [English → README.md](README.md)** (bản GitHub hiển thị mặc định)

[Hub tài liệu](docs/README.md) · [Kiến trúc](docs/ARCHITECTURE.md) · [Chạy Docker](#docker-quick-start) · [Dev local](#local-dev) · [API tổng quan](#api-overview) · [Đóng góp](#contributing)

**Repository:** [github.com/trhlow/EDUCYCLE](https://github.com/trhlow/EDUCYCLE) · **Tác giả:** Trần Hoàng Long

</div>

---

## 📖 Mục lục

- [Đây là gì?](#what-is-this)
- [Tài liệu](#documentation)
- [Tự host](#self-hosting)
- [Cấu hình](#configuration)
- [Địa chỉ truy cập](#access-urls)
- [Nâng cao](#advanced)
- [Tính năng chính](#core-features)
- [API tổng quan](#api-overview)
- [Email (SMTP)](#email-smtp)
- [AI chatbot](#ai-chatbot)
- [Kiểm thử & CI](#testing-ci)
- [Cấu trúc repo](#project-layout)
- [Công nghệ](#tech-stack)
- [Đóng góp](#contributing)
- [License](#license)

---

<a id="what-is-this"></a>
## ❓ Đây là gì?

EduCycle là **chợ P2P giữa sinh viên**: tin đăng được kiểm duyệt, giao dịch đi theo **trạng thái rõ ràng**, và **giao nhận trực tiếp** dùng **OTP do người mua tạo / người bán xác nhận** — không phải flow giỏ hàng thanh toán online. Repo là **monorepo** API Spring Boot + giao diện React, có REST và WebSocket; xem chi tiết trên Swagger khi chạy API.

| Khám phá | Chi sâu |
|----------|---------|
| [docs/README.md](docs/README.md) — hub tài liệu | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — runtime, auth, WS, audit (mục 10) |
| [docs/NOTES.md](docs/NOTES.md) — sprint, mapping FE↔BE | [docs/guides/](docs/guides/) — TLS, AI, Git/Cursor, … |
| [.env.example](.env.example) — mẫu env Docker | [scripts/README.md](scripts/README.md) — script `verify` |

> **Ghi chú thiết kế:** Hai cách chạy (**Docker một lệnh** vs **dev hybrid** Postgres + `mvn` + Vite) là **cố ý** — vừa demo gần prod, vừa sửa code nhanh. Chi tiết: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

<a id="documentation"></a>
## 📚 Tài liệu

Vào [docs/README.md](docs/README.md) để xem mục lục đầy đủ. File **[README.vi.md](README.vi.md)** là bản tiếng Việt; bản tiếng Anh (mặc định trên GitHub): [README.md](README.md).

| Tài liệu | Mục đích |
|----------|-----------|
| [docs/README.md](docs/README.md) | Hub tài liệu |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Topology, auth/WebSocket, checklist |
| [docs/NOTES.md](docs/NOTES.md) | Trạng thái sprint, quy tắc nội bộ |
| [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md) | AI — điểm vào ngắn |
| [docs/guides/ai-chatbot.md](docs/guides/ai-chatbot.md) | AI — chi tiết |

---

<a id="self-hosting"></a>
<a id="running-the-application"></a>
## 🚀 Tự host

<a id="docker-quick-start"></a>
<a id="option-1-docker-compose-recommended-for-demo"></a>
### Bắt đầu nhanh: Docker

Tại **thư mục gốc repo** (có `docker-compose.yml`), copy file môi trường rồi chạy stack. Nginx phục vụ SPA build sẵn và proxy `/api`, `/ws` tới API. Postgres chạy trong mạng nội bộ (mặc định không publish cổng DB ra máy host).

**Bash / Git Bash / macOS / Linux**

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
cp .env.example .env
# chỉnh POSTGRES_PASSWORD, JWT_SECRET trong .env
docker compose up --build
```

**PowerShell (Windows)**

```powershell
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
Copy-Item .env.example .env
docker compose up --build
```

Sau đó mở **http://localhost** (nginx cổng **80**).

→ Pitfall đầy đủ (pgAdmin, cổng DB): [Nâng cao](#advanced).

---

<a id="local-dev"></a>
<a id="option-2-local-development-recommended-for-coding"></a>
### Cài đặt thủ công: dev local

Dùng khi cần hot reload Vite và debug Java. Chạy Postgres cổng **5433**, API **8081** với profile Spring **`docker`**, chỉ proxy Vite tới **8081**, rồi `npm run dev`.

**1) PostgreSQL (cổng host 5433)**

```bash
cd backend/educycle-java
docker compose up -d
```

**2) Backend (API cổng 8081)**

```bash
cd backend/educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

**3) Frontend — proxy**

Tạo `frontend/.env.local` (hoặc `.env.development`):

```env
VITE_DEV_PROXY_TARGET=http://localhost:8081
```

**4) Cài và chạy Vite**

```bash
cd frontend
npm ci
npm run dev
```

**5) Đăng nhập thử**

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@educycle.com` | `admin@1` |

> Mặc định proxy Vite trỏ **8080**. Nếu API chạy **8081** mà không set `VITE_DEV_PROXY_TARGET`, gọi `/api` sẽ lỗi.

---

<a id="configuration"></a>
## ⚙️ Cấu hình

### Yêu cầu

JDK **26+**, Node **24+** (CI dùng Node **24**), Maven **3.9+**, Docker Desktop (khuyến nghị).

### Biến môi trường (tóm tắt)

**Không** commit secret. Dùng [.env.example](.env.example) làm mẫu cho `docker-compose` ở root.

| Biến | Vị trí | Mục đích |
|------|--------|----------|
| `JWT_SECRET` | `.env` ở root repo | Ký JWT HMAC (độ dài ≥ 32) |
| `APP_FRONTEND_BASE_URL` | Docker `.env` | Link trong email |
| `ANTHROPIC_API_KEY` | Container API / BE | AI chỉ trên server (`POST /api/ai/chat`) |
| `SPRING_PROFILES_ACTIVE` | vd. `production,smtp` | SMTP thật khi đã set `MAIL_*` |
| `MAIL_*` | `.env` + profile `smtp` | Gửi email |
| `VITE_DEV_PROXY_TARGET` | `frontend/.env.local` | **8081** khi BE chạy profile **`docker`** |

**OAuth:** URI redirect và client ID phải khớp đăng ký Google/Azure — xem [docs/NOTES.md](docs/NOTES.md).

**Bảo mật:** Không nhét **API key** LLM vào bundle frontend; SPA chỉ gọi proxy backend.

---

<a id="access-urls"></a>
## 🔗 Địa chỉ truy cập

| Dịch vụ | Docker full stack | Dev local |
|---------|-------------------|-----------|
| **Web** | http://localhost (**80**) | http://localhost:**5173** |
| **API (từ máy)** | Cùng origin `/api` qua nginx | http://localhost:**8081** |
| **Swagger UI** | Mặc định không mở ra ngoài | http://localhost:8081/swagger-ui.html |
| **Postgres trên host** | Mặc định không publish | **localhost:5433** (compose module backend) |

---

<a id="advanced"></a>
## 🧩 Nâng cao

**Postgres & pgAdmin:** Compose ở root không mở `5432/5433`. Dùng `backend/educycle-java/docker-compose.yml`, override `ports:` trên service `db`, hoặc `docker exec` + `psql`.

**CORS:** Danh sách origin trong `application.yml` — cập nhật khi deploy domain thật.

**API cổng 8080:** Chạy `mvn spring-boot:run` **không** profile `docker` → API **8080**, Postgres **5432**. Khi đó:

```env
VITE_DEV_PROXY_TARGET=http://localhost:8080
```

**Flyway:** Trong repo có migration **V1–V16**; file tiếp theo phải là **`V17__....sql`**. Không sửa migration đã apply trên DB dùng chung. Chi tiết: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

<a id="core-features"></a>
## ⭐ Tính năng chính

- **Xác thực:** Đăng ký **`.edu.vn`** + OTP trước lần đăng nhập đầu; đăng nhập bằng email đã xác minh (kể cả admin). JWT + refresh token xoay vòng.
- **Mật khẩu:** Quên / đặt lại (link token); đổi khi đã đăng nhập.
- **Tin đăng:** CRUD, phân trang server, upload ảnh (ổ đĩa / volume Docker), admin duyệt/từ chối có lý do.
- **Giao dịch:** Máy trạng thái; người mua tạo OTP, người bán xác nhận; tranh chấp + xử lý admin.
- **Realtime:** Chat STOMP/SockJS theo giao dịch; thông báo (DB + WS).
- **Uy tín:** Hồ sơ công khai `/users/:id` qua `GET /api/public/users/{userId}`.
- **Hồ sơ:** PATCH thông tin và cài đặt thông báo trên server.
- **AI (tuỳ chọn):** Proxy Claude phía server — [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md).

---

<a id="api-overview"></a>
## 🔌 API tổng quan

Base **`/api`**. Tài liệu tương tác: **Swagger UI** khi API đang chạy.

| Khu vực | Ví dụ |
|---------|--------|
| **Auth** | `/api/auth/login`, `register`, `verify-otp`, `refresh`, … |
| **Users** | `GET/PATCH /api/users/me`, `PATCH .../notification-preferences` |
| **Public** | `GET /api/public/users/{userId}` |
| **Products** | `GET /api/products` (phân trang), upload ảnh, `GET /api/files/**` |
| **Transactions** | `POST /api/transactions`, OTP, verify, dispute, … |
| **Admin** | Giao dịch tranh chấp, kiểm duyệt sản phẩm (xem Swagger) |
| **Khác** | `categories`, `reviews`, `notifications`, `POST /api/ai/chat` |
| **WebSocket** | `/ws/**` (SockJS + STOMP) |

### Luồng giao dịch

```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED
         ↘ REJECTED
         ↘ CANCELLED
```

1. Người mua tạo OTP (server kiểm soát).  
2. Đọc mã **6 số** cho người bán trực tiếp.  
3. Người bán xác nhận → **COMPLETED**, sản phẩm **SOLD**.

---

<a id="email-smtp"></a>
## ✉️ Email (SMTP)

Không bật profile **`smtp`** thì `MailService` **ghi log** nội dung email (đủ cho demo — OTP xem trong log API). Gửi thật: bật **`smtp`**, cấu hình `MAIL_*` (xem `application-smtp.yml`), Gmail dùng App Password; Docker thêm `SPRING_PROFILES_ACTIVE=production,smtp`. Không để `MAIL_HOST` rỗng nếu không dùng SMTP.

---

<a id="ai-chatbot"></a>
## 🤖 AI chatbot

Chỉ đặt **`ANTHROPIC_API_KEY`** trên tiến trình **API**. Trình duyệt chỉ gọi **`POST /api/ai/chat`**. Chi tiết: [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md).

---

<a id="testing-ci"></a>
<a id="testing--ci"></a>
## 🧪 Kiểm thử & CI

**Workflow:** [.github/workflows/ci.yml](.github/workflows/ci.yml) — khi **push** và **pull_request** lên **`main`** và **`dev`**.

| Job | Lệnh |
|-----|------|
| Backend | `mvn -f backend/educycle-java/pom.xml clean verify` |
| Frontend | `npm ci` → `npm run typecheck` → `npm test` → `npm run build` trong `frontend` |
| E2E | Playwright trong `frontend` (xem workflow) |

**Kiểm tra local trước khi push**

```bash
bash scripts/verify.sh
```

```powershell
.\scripts\verify.ps1
```

---

<a id="project-layout"></a>
## 📁 Cấu trúc repo

Gốc repo giữ **mã chạy**, **compose**, **README**, file **VERSION** — tài liệu dài trong **`docs/`**.

```
EDUCYCLE/
├── backend/educycle-java/   # API (Spring Boot, Flyway)
├── frontend/                # SPA (Vite + React)
├── docs/
├── scripts/
├── VERSION
├── docker-compose.yml
├── .github/workflows/
├── .env.example
├── README.md                # English (mặc định GitHub)
└── README.vi.md             # Tiếng Việt (file này)
```

---

<a id="tech-stack"></a>
## 🛠️ Công nghệ

| Tầng | Công nghệ |
|------|-----------|
| API | Java 26, Spring Boot 4.0.5, Spring Security, JPA, Flyway |
| Auth | JWT (JJWT), refresh token (SecureRandom), `.edu.vn` + OTP email |
| DB | PostgreSQL 18 |
| Realtime | STOMP + SockJS |
| Giới hạn tốc độ | Bucket4j; giới hạn riêng cho AI chat |
| SPA | React 19, Vite 8, React Router 7, Axios, TanStack Query |
| Build | Maven, npm |
| Triển khai | Docker multi-stage + Compose |

---

<a id="contributing"></a>
## 🤝 Đóng góp

Nhánh chính **`dev`**; release gộp vào **`main`**. Dùng [Conventional Commits](https://www.conventionalcommits.org/) — quy ước và **một commit một lĩnh vực** trong [docs/NOTES.md](docs/NOTES.md) (mục 4). Ưu tiên **`git add <từng file>`** thay vì `git add .`.

---

<a id="license"></a>
## 📄 License

Dự án học tập / cá nhân — không dùng thương mại nếu không có thoả thuận riêng.

---

## 🙏 Lời cảm ơn

Xây dựng với **Spring Boot**, **React**, **PostgreSQL** và hệ sinh thái mã nguồn mở. AI tuỳ chọn: [docs/SETUP_CHATBOT.md](docs/SETUP_CHATBOT.md) và [docs/NOTES.md](docs/NOTES.md).
