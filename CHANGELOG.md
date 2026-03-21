# Changelog

Mọi thay đổi đáng chú ý của monorepo **EduCycle** được ghi tại đây.
Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased] — v0.6.x

### Fixed (Frontend)
- `AuthContext`: isAdmin check normalize UPPERCASE — `toUpperCase() === 'ADMIN'`
- `TransactionDetailPage`: STATUS_CONFIG keys đổi sang UPPERCASE, toàn bộ condition checks
- `AuthContext`: xóa mock bypass — throw lỗi thật khi backend down
- `endpoints.js`: thêm verifyOtp, resendOtp, socialLogin, verifyPhone vào authApi
- `AuthContext`: export verifyOtp, resendOtp, socialLogin, verifyPhone
- `AuthPage`: thêm OTP verification step sau register
- `Navbar`: fix crash khi notifications là null — defensive Array.isArray check

### Added (Frontend)
- `ErrorBoundary.jsx`: crash recovery cho toàn app
- `utils/safeSession.js`: đọc/xóa session localStorage an toàn
- `utils/safeStorage.js`: đọc JSON array từ localStorage an toàn
- `NotificationContext.jsx`: STOMP subscribe + 30s poll fallback
- `websocket.js`: createChatClient(), sendChatMessage() qua STOMP

---

## [0.5.0] — 2026-03-21 (Backend — 5 modules)

### Added
- **Module 1 — Refresh Token**: SecureRandom 64 bytes, rotation, V2 migration, `/auth/refresh` + `/auth/logout`
- **Module 2 — CORS Whitelist**: CorsProperties, whitelist từ application.yml, allowCredentials=true
- **Module 3 — Rate Limiting**: Bucket4j, auth endpoints 5 req/min, API 60 req/min, per-IP với X-Forwarded-For
- **Module 4 — WebSocket Chat**: STOMP, SockJS, WebSocketAuthInterceptor (JWT auth qua STOMP header)
- **Module 5 — Notification System**: bảng notifications, V3 migration, STOMP broadcast `/user/{id}/queue/notifications`, 5 trigger points

---

## [0.4.0] — 2026-03-17 (Monorepo + Tài liệu)

### Added
- Gộp frontend repo (`trhlow/educycle-frontend`) và backend repo (`trhlow/EduCycle_Java_Backend_`) vào monorepo `trhlow/EDUCYCLE`
- Cấu trúc: `source/backend/educycle-java/` + `source/frontend/`
- Root tài liệu AI: `AI_CONTEXT.md`, `HOW_TO_USE_AI.md`, `GITFLOW.md`
- GitHub Actions CI workflow

---

## [0.3.0] — 2026-03-16 (Frontend — Reviews)

### Added
- User-to-user reviews — hệ thống đánh giá 1–5 sao sau giao dịch

---

## [0.2.0] — 2026-03-15 (Frontend — Social Login + OTP)

### Added
- OAuth social login (Google, Facebook, Microsoft)
- Email OTP verification flow

---

## [0.1.0] — 2026-03-14 (Frontend — Initial)

### Added
- Khởi tạo frontend React 19 + Vite 7
- Authentication, Product CRUD, Transaction flow, Admin panel

---

## Ghi chú kỹ thuật

- Dự án ban đầu dùng ASP.NET Core 10 + EF Core + SQL Server. Đã migrate hoàn toàn sang **Java 17 + Spring Boot 3.2.5 + PostgreSQL + Flyway**.
- BCrypt format `$2a$` tương thích giữa BCrypt.Net-Next (C#) và BCryptPasswordEncoder (Java) — password hash cũ vẫn hợp lệ.
- Admin seed: `admin@educycle.com` / `admin@1` (BCrypt cost 11, trong V1 migration).
- Password admin được cập nhật từ `admin@admin` → `admin@1` vào 2026-02-17.
