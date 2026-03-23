# EduCycle

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**EduCycle** là nền tảng trao đổi sách và tài liệu học tập dành cho sinh viên — dự án cá nhân do **Trần Hoàng Long** thiết kế và phát triển.

---

## Tổng quan

EduCycle giúp sinh viên tìm, đăng bán và trao đổi sách giáo trình, tài liệu học tập một cách nhanh gọn, minh bạch và tiết kiệm chi phí. Hệ thống bao gồm REST API (Java 17 + Spring Boot) và giao diện SPA (React 19 + Vite 7).

### Tính năng chính

- Đăng ký / đăng nhập bằng email `.edu.vn`, Google hoặc Microsoft
- Xác thực email qua OTP
- Đăng bán, tìm kiếm và duyệt sản phẩm
- Giao dịch P2P với OTP xác nhận khi gặp mặt
- Chat thời gian thực qua WebSocket (STOMP)
- Hệ thống thông báo (database + STOMP)
- Đánh giá người bán / người mua
- Trang quản trị duyệt sản phẩm, quản lý người dùng

---

## Cấu trúc dự án

```
EDUCYCLE/
├── source/
│   ├── backend/educycle-java/   # REST API — Java 17 + Spring Boot 3.2.5
│   └── frontend/                # SPA — React 19 + Vite 7
├── .github/workflows/           # CI/CD
├── NOTES.md                     # Trạng thái dự án, changelog, quy tắc
└── README.md
```

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| Cơ sở dữ liệu | PostgreSQL 16, Flyway migrations |
| Xác thực | JWT (JJWT 0.12.5), Refresh Token rotation, OAuth2 (Google, Microsoft) |
| Thời gian thực | WebSocket STOMP + SockJS |
| Giới hạn truy cập | Bucket4j (per-IP rate limiting) |
| Frontend | React 19, Vite 7, Axios, Context API, React Router 7 |
| OAuth SDK | @react-oauth/google, @azure/msal-browser |
| Build | Maven (BE), npm + Vite (FE) |
| Container | Docker Compose (PostgreSQL) |

---

## Hướng dẫn chạy

### Yêu cầu

- Java 17+
- Node.js 18+
- Docker Desktop (để chạy PostgreSQL qua Docker)
- Maven 3.9+

### 1. Clone dự án

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE
```

### 2. Khởi động PostgreSQL

```bash
cd source/backend/educycle-java
docker compose up -d
```

PostgreSQL sẽ chạy trên port **5433** với database `educycledb`.

### 3. Chạy Backend

```bash
cd source/backend/educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

API sẽ chạy trên **http://localhost:8081**. Flyway tự động tạo schema khi khởi động.

Swagger UI: http://localhost:8081/swagger-ui.html

### 4. Chạy Frontend

```bash
cd source/frontend
npm install
npm run dev
```

Ứng dụng sẽ chạy trên **http://localhost:5173**. Vite proxy tự động chuyển `/api` và `/ws` về backend.

### 5. Đăng nhập thử

| Tài khoản | Email | Mật khẩu |
|-----------|-------|----------|
| Admin | `admin@educycle.com` | `admin@1` |

---

## Cổng mặc định

| Thành phần | URL |
|------------|-----|
| Frontend (Vite dev) | http://localhost:5173 |
| Backend (profile `docker`) | http://localhost:8081 |
| PostgreSQL (Docker) | localhost:5433 |
| Swagger UI | http://localhost:8081/swagger-ui.html |

> Nếu chạy backend không dùng profile `docker` (port 8080), tạo file `source/frontend/.env.local` với nội dung:
> ```
> VITE_DEV_PROXY_TARGET=http://localhost:8080
> ```

### Email (SMTP — tuỳ chọn)

OTP đăng ký, gửi lại OTP và **quên mật khẩu** dùng `MailService`. Nếu chưa cấu hình SMTP, backend vẫn chạy và **ghi nội dung email vào log** (tiện cho dev).

Để gửi email thật, cấu hình Spring Mail (ví dụ Gmail [App Password](https://support.google.com/accounts/answer/185833)) trong `application.yml` hoặc biến môi trường, ví dụ:

| Mục | Ví dụ |
|-----|--------|
| `spring.mail.host` | `smtp.gmail.com` |
| `spring.mail.port` | `587` |
| `spring.mail.username` | địa chỉ Gmail |
| `spring.mail.password` | App Password |
| `spring.mail.properties.mail.smtp.auth` | `true` |
| `spring.mail.properties.mail.smtp.starttls.enable` | `true` |
| `app.mail-from` | `EduCycle <your@gmail.com>` |
| `app.frontend-base-url` | `http://localhost:5173` (link trong email đặt lại mật khẩu) |

---

## API Endpoints

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký (gửi OTP qua email) |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/verify-otp` | Xác thực OTP |
| POST | `/api/auth/resend-otp` | Gửi lại OTP |
| POST | `/api/auth/social-login` | Đăng nhập Google / Microsoft |
| POST | `/api/auth/refresh` | Làm mới JWT |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/verify-phone` | Xác thực số điện thoại |
| POST | `/api/auth/forgot-password` | Quên mật khẩu (email có link đặt lại) |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu (`token`, `newPassword`) |

### Products

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| POST | `/api/products` | Đăng sản phẩm mới |
| PUT | `/api/products/{id}` | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Xóa sản phẩm |

### Transactions

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/transactions` | Tạo giao dịch |
| GET | `/api/transactions/mine` | Giao dịch của tôi |
| PATCH | `/api/transactions/{id}/status` | Cập nhật trạng thái |
| POST | `/api/transactions/{id}/otp` | Tạo mã OTP |
| POST | `/api/transactions/{id}/verify-otp` | Xác nhận OTP |
| POST | `/api/transactions/{id}/confirm` | Xác nhận nhận hàng |
| POST | `/api/transactions/{id}/dispute` | Báo tranh chấp (người mua, trạng thái MEETING) |

### Admin (role ADMIN)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/transactions/disputed` | Danh sách giao dịch tranh chấp |
| PATCH | `/api/admin/transactions/{id}/resolve` | Xử lý: `resolution` = `COMPLETED` hoặc `CANCELLED` |

### Khác

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/public/users/{userId}` | Hồ sơ công khai + đánh giá gần đây |
| GET | `/api/categories` | Danh mục |
| POST | `/api/reviews` | Đánh giá |
| GET | `/api/notifications` | Thông báo |
| GET | `/ws/**` | WebSocket (STOMP/SockJS) |

---

## Luồng giao dịch

```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED  (người mua báo tranh chấp)
         ↘ REJECTED             (người bán từ chối)
         ↘ CANCELLED            (người mua hủy)
```

**Xác nhận OTP khi gặp mặt:**
1. Người mua tạo mã OTP 6 số
2. Người mua đọc mã cho người bán
3. Người bán nhập mã → giao dịch hoàn thành, sản phẩm chuyển trạng thái SOLD

---

## CI/CD

GitHub Actions workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

- **Trigger:** push và pull request tới `main`, `dev`
- **Backend:** `mvn clean compile` trong `source/backend/educycle-java`
- **Frontend:** `npm ci && npm run build` trong `source/frontend`

---

## Tác giả

**Trần Hoàng Long** — thiết kế, phát triển và hoàn thiện toàn bộ dự án EduCycle.

---

## Giấy phép

Dự án phục vụ mục đích học tập — không sử dụng cho mục đích thương mại trừ khi có thỏa thuận riêng.
