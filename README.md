# EduCycle

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**EduCycle** — nền tảng **P2P** để sinh viên trao đổi sách và tài liệu học tập: đăng bán, duyệt tin, giao dịch có trạng thái, chat thời gian thực, đánh giá uy tín.  
Dự án cá nhân: **Trần Hoàng Long** (full-stack: Java/Spring + React).

---

## Mục lục

1. [Tài liệu trong repo](#tài-liệu-trong-repo)
2. [Chạy nhanh — hai cách](#chạy-nhanh--hai-cách)
3. [Yêu cầu môi trường](#yêu-cầu-môi-trường)
4. [Biến môi trường & bảo mật](#biến-môi-trường--bảo-mật)
5. [Cổng, proxy Vite & Postgres](#cổng-proxy-vite--postgres)
6. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
7. [Stack kỹ thuật](#stack-kỹ-thuật)
8. [Tính năng chính](#tính-năng-chính)
9. [API tóm tắt](#api-tóm-tắt)
10. [Luồng giao dịch & OTP](#luồng-giao-dịch--otp)
11. [Email (SMTP)](#email-smtp)
12. [AI chatbot](#ai-chatbot)
13. [Kiểm thử & CI](#kiểm-thử--ci)
14. [Đóng góp & nhánh](#đóng-góp--nhánh)
15. [Giấy phép](#giấy-phép)

---

## Tài liệu trong repo

| File | Mục đích |
|------|----------|
| **README.md** | *(file này)* — clone, chạy, API tóm tắt, pitfall thường gặp |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Sơ đồ runtime, auth/WS, **đối chiếu checklist audit** (§10), onboarding chi tiết |
| [**NOTES.md**](NOTES.md) | Trạng thái sprint, changelog, FE↔BE field mapping, quy tắc nội bộ |
| [**SETUP_CHATBOT.md**](SETUP_CHATBOT.md) | Cấu hình Claude / `ANTHROPIC_API_KEY`, Docker |
| [**.env.example**](.env.example) | Gợi ý biến cho Docker gốc (`JWT_SECRET`, SMTP, …) |

---

## Chạy nhanh — hai cách

### Cách A — Một lệnh Docker (gần production)

Từ **thư mục gốc** repo (có `docker-compose.yml`):

```bash
# Linux / macOS / Git Bash — JWT đủ dài, không commit
export JWT_SECRET="$(openssl rand -base64 48)"
docker compose up --build
```

**PowerShell (Windows):**

```powershell
$env:JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
docker compose up --build
```

- **Ứng dụng:** http://localhost — nginx phục vụ SPA build + reverse proxy **`/api`** và **`/ws`** tới container API.
- **Postgres:** chỉ trong mạng Docker (**không** mở cổng DB ra máy host).
- **Upload ảnh:** volume `educycle_uploads` → `/app/data/uploads` trong container API.

Tuỳ chọn: copy [`.env.example`](.env.example) → `.env` cạnh `docker-compose.yml` (`JWT_SECRET`, `ANTHROPIC_API_KEY`, `SPRING_PROFILES_ACTIVE=production,smtp` + `MAIL_*` nếu cần email thật).

### Cách B — Dev hybrid (sửa code nhanh)

Phù hợp khi develop FE + BE trên máy, Postgres trong Docker.

1. **Postgres** (map **5433** → host):

```bash
cd source/backend/educycle-java
docker compose up -d
```

2. **Backend** (API **8081**, DB `localhost:5433`):

```bash
cd source/backend/educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

3. **Frontend** — proxy phải trỏ **8081**:

Tạo `source/frontend/.env.local` (hoặc chỉnh `.env.development`):

```env
VITE_DEV_PROXY_TARGET=http://localhost:8081
```

```bash
cd source/frontend
npm ci
npm run dev
```

- **App:** http://localhost:5173  
- **Swagger:** http://localhost:8081/swagger-ui.html  

4. **Tài khoản thử nghiệm**

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@educycle.com` | `admin@1` |

---

## Yêu cầu môi trường

- **JDK 17+**
- **Node.js 18+** (CI dùng Node 20)
- **Maven 3.9+**
- **Docker Desktop** (Postgres dev hoặc full stack)

---

## Biến môi trường & bảo mật

- **Không** commit file `.env` chứa secret; dùng [`.env.example`](.env.example) làm mẫu.
- **`JWT_SECRET`:** chuỗi ngẫu nhiên đủ dài (≥ 32 ký tự) cho mọi môi trường không phải toy.
- **OAuth (Google / Microsoft):** Client ID cấu hình ở FE (`VITE_*`) và khớp backend (`application.yml` / env) — xem [NOTES.md](NOTES.md) phần FE↔BE.
- **Anthropic:** API key chỉ nên có trên **server** (Docker `api` / biến môi trường BE). Widget FE gọi **`POST /api/ai/chat`** — không nhúng key vào bundle.

---

## Cổng, proxy Vite & Postgres

| Thành phần | Dev hybrid (Cách B) | Docker full stack (Cách A) |
|------------|---------------------|----------------------------|
| SPA | http://localhost:5173 | http://localhost (**nginx**, cổng **80**) |
| API (host) | http://localhost:8081 | *(không publish; chỉ qua `/api`)* |
| Postgres (host) | **localhost:5433** *(chỉ khi chạy `educycle-java/docker-compose`)* | *(không có trên host)* |
| Swagger | http://localhost:8081/swagger-ui.html | qua tunnel/exec hoặc tạm publish cổng *(mặc định không)* |

**Pitfall thường gặp**

- Vite mặc định proxy tới **8080**. Nếu BE chạy profile **docker** trên **8081** mà quên `VITE_DEV_PROXY_TARGET` → lỗi network / 500.
- **pgAdmin** `localhost:5433` **timeout** nếu bạn chỉ chạy `docker-compose` **gốc repo** (DB không publish). Dùng `source/backend/educycle-java/docker-compose.yml` hoặc tự thêm `ports` cho service `db`.

Chi tiết: [ARCHITECTURE.md](ARCHITECTURE.md) §2, §7–§8.

---

## Cấu trúc thư mục

```
EDUCYCLE/
├── source/
│   ├── backend/educycle-java/     # Spring Boot API, Flyway V1–V8 (tiếp theo: V9)
│   └── frontend/                  # React 19 + Vite 7
├── docker-compose.yml             # db + api + web (nginx)
├── .github/workflows/ci.yml
├── .env.example
├── ARCHITECTURE.md
├── NOTES.md
├── SETUP_CHATBOT.md
└── README.md
```

---

## Stack kỹ thuật

| Lớp | Công nghệ |
|-----|-----------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA, Flyway |
| Auth | JWT (JJWT), refresh token (SecureRandom), OAuth ID token verify (Google / Microsoft JWKS) |
| DB | PostgreSQL 16 |
| Realtime | WebSocket STOMP + SockJS, thông báo DB + broadcast |
| Hạn chế tải | Bucket4j (theo IP); AI chat: rate limit in-memory (xem code / SETUP_CHATBOT) |
| Frontend | React 19, Vite 7, React Router 7, Axios, Context API |
| OAuth FE | @react-oauth/google, @azure/msal-browser |
| Build | Maven (BE), npm + Vite (FE) |
| Container | Multi-stage Dockerfile (BE/FE), Compose |

---

## Tính năng chính

- Đăng ký / đăng nhập (email `.edu.vn`, Google, Microsoft), OTP email, refresh token
- Quên mật khẩu / đặt lại mật khẩu (link + token; cần SMTP nếu muốn email thật)
- Sản phẩm: CRUD, **phân trang** (`GET /api/products?page=&size=&direction=`), upload ảnh cục bộ, duyệt / từ chối (admin + lý do)
- Giao dịch P2P: trạng thái, **OTP chỉ buyer tạo / seller xác nhận**, tranh chấp, admin xử lý
- Chat theo giao dịch (STOMP), thông báo
- Hồ sơ người dùng, **hồ sơ công khai** `/users/:id`, cài đặt thông báo (BE)
- Trợ lý AI (Claude) qua backend — [SETUP_CHATBOT.md](SETUP_CHATBOT.md)
- Trang hướng dẫn giao dịch, About/Contact

---

## API tóm tắt

Base path: **`/api`**. Tài liệu đầy đủ: **Swagger UI** khi BE đang chạy (xem bảng cổng).

### Auth

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/auth/register` | Đăng ký + OTP email |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/verify-otp` | Xác thực email |
| POST | `/api/auth/resend-otp` | Gửi lại OTP |
| POST | `/api/auth/social-login` | Google / Microsoft (body: `provider`, `token`) |
| POST | `/api/auth/refresh` | Làm mới JWT |
| POST | `/api/auth/logout` | Thu hồi refresh token |
| POST | `/api/auth/verify-phone` | Cập nhật & xác thực SĐT |
| POST | `/api/auth/forgot-password` | Gửi link đặt lại mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu (`token`, `newPassword`) |
| POST | `/api/auth/change-password` | Đổi mật khẩu (JWT) |

### Users & public

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/users/me` | Hồ sơ (JWT) |
| PATCH | `/api/users/me` | Cập nhật hồ sơ |
| PATCH | `/api/users/me/notification-preferences` | Bật/tắt loại thông báo |
| GET | `/api/public/users/{userId}` | Hồ sơ công khai + review gần đây |

### Products & files

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/products` | Danh sách (công khai, phân trang) |
| GET | `/api/products/{id}` | Chi tiết |
| GET | `/api/products/mine` | Sản phẩm của tôi (JWT) |
| POST | `/api/products` | Tạo (JWT) |
| PUT | `/api/products/{id}` | Sửa (JWT) |
| DELETE | `/api/products/{id}` | Xóa (JWT) |
| POST | `/api/upload/product-image` | Upload ảnh (JWT) |
| GET | `/api/files/**` | Phục vụ file đã upload (đọc công khai theo cấu hình) |

Admin duyệt / từ chối: các route **`/api/products/...`** có `@PreAuthorize("hasRole('ADMIN')")` (Swagger).

### Transactions & chat

| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/transactions` | Tạo giao dịch |
| GET | `/api/transactions/mine` | Danh sách của tôi |
| PATCH | `/api/transactions/{id}/status` | Đổi trạng thái |
| POST | `/api/transactions/{id}/otp` | **Buyer** tạo OTP |
| POST | `/api/transactions/{id}/verify-otp` | **Seller** xác nhận OTP |
| POST | `/api/transactions/{id}/confirm` | Xác nhận nhận hàng |
| POST | `/api/transactions/{id}/dispute` | Báo tranh chấp (buyer, MEETING) |
| GET/POST | `/api/messages/...` | Tin nhắn (HTTP fallback) |
| — | `/ws/**` | WebSocket STOMP (SockJS) |

### Admin

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/admin/stats` | Thống kê |
| GET | `/api/admin/users` | Người dùng |
| GET | `/api/admin/transactions/disputed` | Giao dịch tranh chấp |
| PATCH | `/api/admin/transactions/{id}/resolve` | `resolution`: COMPLETED / CANCELLED |

### Khác

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/categories` | Danh mục |
| POST | `/api/reviews` | Tạo đánh giá |
| GET | `/api/notifications` | Thông báo |
| POST | `/api/ai/chat` | Chat AI (JWT) |
| GET | `/actuator/health` | Health (cấu hình permit) |

---

## Luồng giao dịch & OTP

```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED   (buyer, trước khi hoàn tất OTP)
         ↘ REJECTED
         ↘ CANCELLED
```

1. **Buyer** gọi tạo OTP (chỉ buyer).  
2. Buyer đọc mã 6 số cho **seller** tại chỗ.  
3. **Seller** gọi verify OTP (chỉ seller) → `COMPLETED`, sản phẩm **SOLD**.  

Admin xử lý tranh chấp qua `/api/admin/transactions/...`.

---

## Email (SMTP)

- **`MailService`:** nếu **không** bật profile **`smtp`** → nội dung mail được **log** (đủ cho dev / demo có log OTP).
- **Email thật:** thêm profile **`smtp`**, biến `MAIL_*`, xem [`application-smtp.yml`](source/backend/educycle-java/src/main/resources/application-smtp.yml) và mục tương ứng trước đây trong README cũ — chi tiết đầy đủ: [Gmail App Password](https://support.google.com/accounts/answer/185833), `SPRING_PROFILES_ACTIVE=production,smtp` trong `.env` khi dùng Compose.

---

## AI chatbot

- Cấu hình server-side: [**SETUP_CHATBOT.md**](SETUP_CHATBOT.md) (`ANTHROPIC_API_KEY` trên container API / env BE).

---

## Kiểm thử & CI

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- **Trigger:** `push` / `pull_request` lên `main`, `dev`
- **Backend:** `mvn -f source/backend/educycle-java/pom.xml clean verify`
- **Frontend:** `npm ci`, `npm test`, `npm run build` trong `source/frontend`

Trước khi push (local):

```bash
cd source/backend/educycle-java && mvn -q clean verify
cd source/frontend && npm run build
```

---

## Đóng góp & nhánh

- Nhánh chính: **`dev`** → **`main`** khi release.
- Commit: [Conventional Commits](https://www.conventionalcommits.org/) — xem [NOTES.md §4](NOTES.md).
- **Không** `git add .` — stage từng file.

---

## Tác giả

**Trần Hoàng Long** — thiết kế và phát triển EduCycle.

---

## Giấy phép

Dự án phục vụ mục đích học tập — không sử dụng cho mục đích thương mại trừ khi có thỏa thuận riêng.
