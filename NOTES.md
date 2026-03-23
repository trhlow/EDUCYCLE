# EduCycle — NOTES
> Một file duy nhất cho: trạng thái dự án, bugs, roadmap, git workflow, prompt AI, design rules.
> Cập nhật mỗi khi xong task. AI rules chi tiết ở `.cursor/rules/educycle.mdc`.

---

## 1. TRẠNG THÁI DỰ ÁN

**Stack:** Java 17 + Spring Boot 3.2.5 + PostgreSQL + Flyway | React 19 + Vite 7 + Axios + STOMP
**Paths:** `source/backend/educycle-java/` · `source/frontend/`

**Ports (dev):**
- `mvn spring-boot:run` (default) → API **8080**, Postgres **5432**
- `mvn spring-boot:run -Dspring-boot.run.profiles=docker` → API **8081**, Postgres **5433**
- Vite proxy mặc định → `http://localhost:8080` (đã fix, trước là 8081)
- Nếu cần dùng docker profile: tạo `source/frontend/.env.local` → `VITE_DEV_PROXY_TARGET=http://localhost:8081`

**Branch hiện tại:** `dev` — v0.6.x

| Feature | BE | FE | Ghi chú |
|---------|----|----|---------|
| JWT Auth + Refresh Token | ✅ | ✅ | Rotation, V2 migration |
| CORS Whitelist | ✅ | — | CorsProperties + yml |
| Rate Limiting | ✅ | — | Bucket4j 5/min auth, 60/min API |
| WebSocket Chat | ✅ | ✅ | STOMP/SockJS, JWT auth |
| Notification System | ✅ | ✅ | DB + STOMP broadcast, 5 triggers |
| isAdmin + status uppercase | ✅ | ✅ | `.toUpperCase() === 'ADMIN'` |
| OTP step sau register | ✅ | ✅ | Form OTP → verify → login |
| Mock bypass đã xóa | — | ✅ | Throw lỗi thật khi BE down |
| ErrorBoundary + safeSession | — | ✅ | Crash recovery + safe localStorage |
| Email OTP verification (BE) | ✅ | ✅ | Lưu OTP trong DB, verify đúng field name |
| FE↔BE field name sync | ✅ | ✅ | verifyPhone, socialLogin, OTP đều đúng |
| TransactionProductDto fields | ✅ | ✅ | description + category đã có |
| Product SOLD status check | ✅ | ✅ | `.toUpperCase() === 'SOLD'` |
| TransactionGuidePage v2 | — | ✅ | 7 bước, DISPUTED flow, nội quy v2 |
| PATCH `/users/me` + đổi MK | ✅ | ✅ | `UsersController`, `change-password`, ProfilePage gọi thật |
| OTP transaction: buyer/seller guard | ✅ | — | `generateOtp(actor)`, `verifyOtp(actor)` + 403 |
| Cart P2P (không giỏ checkout) | — | ✅ | `/cart` → hướng dẫn; xóa `CartContext` |
| Wishlist copy + CTA yêu cầu mua | — | ✅ | Bỏ thêm giỏ; link chi tiết sản phẩm |

---

## 2. OPEN TASKS — Fix trước khi làm tính năng mới

### 🔴 Cần làm (liên quan logic nghiệp vụ đã spec)

| Issue | File | Impact |
|-------|------|--------|
| Thêm endpoint `POST /transactions/{id}/dispute` | `TransactionsController` + `TransactionServiceImpl` | DISPUTED flow chưa có BE |
| Thêm endpoint `PATCH /admin/transactions/{id}/resolve` | `AdminController` + `AdminService` | Admin xử lý tranh chấp |

### 🟡 Nợ kỹ thuật (không urgent)

| Issue | File | Impact |
|-------|------|--------|
| N+1 query trong `mapAllWithReviews` | `ProductServiceImpl.java` | Perf >50 sản phẩm |
| Social login buttons chưa kết nối thật | `AuthPage.jsx` | UX |
| Email service chưa cấu hình | `AuthServiceImpl.java` | OTP hiện chỉ log ra console |

### Chạy để kiểm tra sau khi fix
```powershell
# Backend
cd D:\EDUCYCLE\source\backend\educycle-java
mvn spring-boot:run
# Swagger: http://localhost:8080/swagger-ui.html
# Health: http://localhost:8080/actuator/health

# Frontend (terminal mới)
cd D:\EDUCYCLE\source\frontend
npm run dev
# App: http://localhost:5173

# Test login
# Email: admin@educycle.com | Password: admin@1
```

---

## 2.5 EXTERNAL REVIEW — Audit ngoại bộ (2026-03-22)

> Nguồn: đánh giá tổng quan EduCycle (template khóa học vs P2P, FE giả API, thiếu endpoint).  
> Mục đích: giữ ngữ cảnh cho roadmap; checklist bên dưới được cập nhật khi hoàn thành từng mục.

### Tóm tắt điểm số (tham chiếu)

| Tiêu chí | Ghi chú ngắn |
|----------|----------------|
| **~5.5/10** tổng thể (production / P2P thật) | Nền tảng kỹ thuật tốt; nhiều luồng profile/cart/wishlist chưa khớp mô hình hoặc chưa gọi BE. |
| Điểm mạnh | Spring Boot + React, OTP giao dịch, WebSocket/STOMP, JWT + refresh, Flyway, OAuth verify JWKS. |
| Điểm yếu cốt lõi | Giỏ hàng/checkout USD không phù hợp P2P; profile đổi MK/xóa TK/cài đặt TB giả; thiếu seller public profile; base64 ảnh; email OTP log console; pagination. |

### Checklist theo sprint (đồng bộ với audit)

#### Sprint 1 — Critical (đang / đã làm trong repo)

- [x] **Cart / concept P2P** — Bỏ giỏ checkout online; trang `/cart` → nội dung P2P + link giao dịch (không CartContext).
- [x] **Wishlist** — Đổi copy “khóa học” → tài liệu/sách; bỏ “Thêm vào giỏ”; CTA “Xem chi tiết & gửi yêu cầu mua”.
- [x] **Profile + BE** — `PATCH /api/users/me`, `POST /api/auth/change-password`; FE `refreshUser` / `saveProfileToServer`.
- [x] **OTP guards BE** — `generateOtp` chỉ buyer; `verifyOtp` chỉ seller (`TransactionServiceImpl` + `@AuthenticationPrincipal`).
- [x] **Xóa tài khoản** — Không còn giả xóa: xác nhận + thông báo chưa hỗ trợ / đăng xuất.

#### Sprint 2 — Missing features

- [x] `POST /auth/forgot-password`, `POST /auth/reset-password`
- [x] `POST /transactions/{id}/dispute`, `GET /admin/transactions/disputed`, `PATCH /admin/transactions/{id}/resolve`
- [x] Trang hồ sơ công khai `/users/:id` (BE `GET /api/public/users/{id}` + FE)
- [x] SMTP / OTP & quên mật khẩu (`spring-boot-starter-mail` + `MailService`; khi chưa cấu hình SMTP vẫn log nội dung)

#### Sprint 3 — Scale & polish

- [ ] Ảnh: Cloudinary / S3 / MinIO (thay base64 DB)
- [ ] Pagination API + FE
- [ ] Edit sản phẩm `/products/:id/edit`
- [ ] Notification preferences lưu BE
- [ ] Admin duyệt: xem ảnh, reject reason, notify seller

#### Sprint 4 — Production

- [ ] OAuth E2E test; skeleton loading; error messages; mobile audit
- [ ] README + deployment (Docker Compose)

### Page scorecard (tham chiếu — không đổi logic code)

Home ~8 · Auth ~7 · ProductDetail ~7 · PostProduct ~7 (base64) · Transactions ~7 · TransactionDetail ~7 · Guide ~7 · Dashboard ~5 · Profile ~4 → ~3 sau Sprint 1 nếu fix API · Wishlist ~3 → cần copy+CTA · Cart ~1 → repurpose · Admin ~6 · OAuthCallback ~5.

---

## 3. BUGS ĐÃ FIX (không làm lại)

| # | Bug | File(s) | Fix |
|---|-----|---------|-----|
| 1 | `isAdmin` luôn false | `AuthContext.jsx` | `=== 'Admin'` → `.toUpperCase() === 'ADMIN'` |
| 2 | STATUS_CONFIG TitleCase | `TransactionDetailPage.jsx` | Keys → UPPERCASE |
| 3 | Mock bypass AuthContext | `AuthContext.jsx` | Xóa MOCK_ACCOUNTS + fallback |
| 4 | endpoints.js thiếu hàm | `endpoints.js` | Thêm verifyOtp/resendOtp/socialLogin/verifyPhone |
| 5 | AuthContext thiếu export | `AuthContext.jsx` | Export đủ 4 methods OTP |
| 6 | AuthPage thiếu OTP step | `AuthPage.jsx` | Form OTP sau register |
| 7 | Navbar crash khi notifications null | `Navbar.jsx` | `Array.isArray()` defensive check |
| 8 | ErrorBoundary thiếu | `main.jsx` | Thêm `ErrorBoundary.jsx` |
| 9 | safeSession/safeStorage thiếu | `utils/` | Tạo mới 2 utils |
| 10 | DashboardPage TitleCase status | `DashboardPage.jsx` | `.toUpperCase()` + UPPERCASE statusMap keys |
| 11 | TransactionsPage TitleCase status | `TransactionsPage.jsx` | STATUS_CONFIG + STATUS_FILTERS → UPPERCASE |
| 12 | flyway-database-postgresql thiếu | `pom.xml` | Thêm dependency |
| 13 | FE README sai stack (.NET→Java) | `source/frontend/README.md` | → Java Spring Boot + port 8080 |
| 14 | `updatedAt` thiếu → "Invalid Date" | `Transaction.java` | `@UpdateTimestamp` + V4 migration |
| 15 | 3 unused npm deps | `package.json` | Xóa react-hot-toast, react-icons, @tanstack/react-query |
| 16 | react-hot-toast import rải rác | 10 page files | → `useToast()` từ `Toast.jsx` |
| 17 | **Vite proxy sai port (Docker 8081 vs mặc định 8080)** | `vite.config.js` + `.env.development` | Default `VITE_DEV_PROXY_TARGET` / fallback → `http://localhost:8080` (`mvn spring-boot:run` không profile); docker **8081** → `.env.local` |
| 18 | **verifyOtp field name mismatch** | `AuthContext.jsx` | `authApi.verifyOtp({ email, otp: otpCode })` — JSON field `otp` khớp `VerifyOtpRequest` |
| 19 | **verifyPhone field name mismatch** | `AuthContext.jsx` | `authApi.verifyPhone({ phone: phoneNumber })` — JSON field `phone` khớp `VerifyPhoneRequest` |
| 20 | **socialLogin field name mismatch** | `AuthContext.jsx` | FE gửi `{ provider, idToken }` → đổi thành `{ provider, token }` (đúng BE `SocialLoginRequest`) |
| 21 | **TransactionProductDto thiếu fields** | `TransactionResponse.java` + `TransactionServiceImpl.java` | Thêm `description` và `category` vào DTO + mapToResponse |
| 22 | **AuthServiceImpl.verifyOtp() luôn throw** | `AuthServiceImpl.java` | Implement OTP thực: sinh OTP trong register, lưu DB, verify đúng + log OTP ra console (dev mode) |
| 23 | **Product status check TitleCase** | `ProductDetailPage.jsx` | `product.status === 'Sold'` → `.toUpperCase() === 'SOLD'` |
| 24 | **TransactionGuidePage OTP flow mơ hồ** | `TransactionGuidePage.jsx` | Viết lại 7 bước, rõ buyer tạo / seller nhập, thêm DISPUTED flow, nội quy v2 |
| 25 | **Sprint 1 — OTP ai cũng gọi được** | `TransactionServiceImpl` + `TransactionsController` | `generateOtp(id, buyerId)`, `verifyOtp(..., sellerId)` + `ForbiddenException` |
| 26 | **Sprint 1 — Profile / đổi MK giả** | BE: `UsersController`, `UserProfileService`, `POST /auth/change-password` · FE: `AuthContext`, `ProfilePage` | `GET/PATCH /users/me`, đổi mật khẩu BCrypt thật |
| 27 | **Sprint 1 — Cart template khóa học** | `CartPage.jsx` + xóa `CartContext` | Trang P2P + link giao dịch; bỏ `CartProvider` |
| 28 | **Sprint 1 — Wishlist sai ngữ cảnh** | `WishlistPage.jsx` | Copy tài liệu/sách; CTA tới chi tiết sản phẩm thay vì giỏ |
| 29 | **TransactionDetail: mất UI / mất chat khi lỗi** | `TransactionDetailPage.jsx` + `axios.js` | Poll 1s→8s (tránh 429); refetch silent không `setLoading`/không xóa state; `fetchMessages(preserve)`; bỏ mock OTP & success giả; WS reconnect khi `educycle:token-refreshed` |
| 30 | **Tạo OTP → "Dữ liệu bị trùng hoặc không hợp lệ"** | `V6__widen_transaction_otp_code.sql` + `Transaction.java` | `otp_code` VARCHAR(10) không chứa được SHA-256 hex (64) → `DataIntegrityViolation` |

---

## 4. GIT WORKFLOW

### Commit format — Conventional Commits
```
<type>(<scope>): <mô tả>
```

| Type | Khi dùng | Scope |
|------|----------|-------|
| `feat` | Tính năng mới | `be` · `fe` · `db` · `ws` · `auth` · `notif` |
| `fix` | Sửa bug | `docs` · `ci` |
| `refactor` | Refactor | |
| `security` | Bảo mật | |
| `chore` | Config/deps | |
| `docs` | Chỉ markdown | |

```bash
feat(be/auth): add refresh token with SecureRandom
fix(fe): normalize status uppercase in DashboardPage
security(be): move JWT secret to env variable
chore(fe): remove unused npm dependencies
```

### Workflow hàng ngày
```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev
git add <specific files>          # KHÔNG git add .
git commit -m "<type>(<scope>): <mô tả>"
git push origin dev
git log -1 --oneline
```

### Branch naming
```
feature/be-<n>  feature/fe-<n>  fix/<n>  docs/<n>
```

### Release
```powershell
cd source\backend\educycle-java && mvn clean compile -q
cd source\frontend && npm run build
git checkout main && git pull origin main
git merge --no-ff dev -m "Release v0.7.0 — ..."
git push origin main && git tag -a v0.7.0 -m "..." && git push origin v0.7.0
```

### Không bao giờ commit
```
source/backend/educycle-java/target/
source/frontend/dist/
source/frontend/node_modules/
.env
```

### Commit cho TransactionGuidePage v2
```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev

git add source/frontend/src/pages/TransactionGuidePage.jsx
git add NOTES.md

git commit -m "feat(fe): rewrite TransactionGuidePage v2 — 7 steps, DISPUTED flow, nội quy v2

- STEPS: 6 → 7 bước, thêm bước Báo tranh chấp trước Đánh giá
- Bước 5 OTP: làm rõ buyer tạo mã / seller nhập mã
- RULES: 3 → 4 mục, thêm Vi phạm & Xử lý
- FAQS: 5 → 6 câu, thêm hỏi ai tạo OTP + điểm uy tín người mới
- Flow diagram: thêm node DISPUTED vào nhánh phụ
- Điểm uy tín mặc định: 5.0 → Chưa có đánh giá"

git push origin dev
```

---

## 5. RULES BẮT BUỘC

1. **Status UPPERCASE** — BE trả `"PENDING"` `"ADMIN"` `"APPROVED"` `"SOLD"` → FE dùng `.toUpperCase()`
2. **Flyway** — V1/V2/V3/V4 không được sửa → thêm V5...
3. **Token** — dùng `SecureRandom` 64 bytes, không `UUID.randomUUID()`
4. **CSS** — dùng `var(--token)` từ `tokens.css`, không hardcode hex
5. **AuthContext** — không có mock fallback, throw lỗi thật
6. **Git** — không `git add .`, stage từng file, dùng Conventional Commits
7. **FE↔BE field mapping** — luôn kiểm tra tên field trong BE DTO record trước khi gọi API
8. **OTP Transaction** — chỉ `buyer` gọi `generateOtp`, chỉ `seller` gọi `verifyOtp` (guard userId)
9. **Dispute flow** — DISPUTED chỉ được set khi status = MEETING và người gọi là buyer

### Audit BE↔FE — các lỗi đã xử lý (v0.6.1)

| # | Vấn đề | File đã sửa |
|---|--------|-------------|
| 17 | Proxy dev mặc định phải **8080** (`mvn spring-boot:run`) | `vite.config.js` |
| 18 | FE gửi `otp` đúng BE — không gửi `otpCode` | `AuthContext.jsx` → `verifyOtp` |
| 19 | FE gửi `{ phone }` — không gửi `phoneNumber` | `AuthContext.jsx` → `verifyPhone` |
| 20 | FE gửi `token` trong body — không gửi `idToken` | `AuthContext.jsx` → `socialLogin` |
| 21 | BE lưu OTP lúc `register`, `verifyOtp` so khớp | `AuthServiceImpl.java` |
| 22 | `TransactionProductDto` có `description` + `category` | `TransactionResponse.java`, `TransactionServiceImpl.java` |
| 23 | So sánh `product.status` với **SOLD** (UPPERCASE) | `ProductDetailPage.jsx` |

### FE↔BE field mapping reference (các trường hay nhầm)

| API / cấu hình | FE gửi / giá trị | BE nhận (record field) |
|----------------|------------------|-------------------------|
| **Dev — Vite proxy** | `VITE_DEV_PROXY_TARGET` trong `.env.local` nếu cần | Mặc định `http://localhost:8080`; chỉ `8081` khi BE profile `docker` |
| `POST /auth/login` | `{ email, password }` | `LoginRequest { email, password }` |
| `POST /auth/register` | `{ username, email, password }` | `RegisterRequest { username, email, password }` |
| `POST /auth/refresh` | `{ refreshToken }` | `RefreshTokenRequest { refreshToken }` |
| `POST /auth/verify-otp` | `{ email, otp }` | `VerifyOtpRequest { email, otp }` |
| `POST /auth/resend-otp` | `{ email }` | `ResendOtpRequest { email }` |
| `POST /auth/social-login` | `{ provider, token, email? }` | `SocialLoginRequest { provider, email, token }` |
| `POST /auth/verify-phone` | `{ phone }` | `VerifyPhoneRequest { phone }` |
| `POST /auth/logout` | `{ refreshToken }` | `RefreshTokenRequest { refreshToken }` |
| `POST /transactions` | `{ productId, sellerId, amount }` | `CreateTransactionRequest` |
| `PATCH /transactions/{id}/status` | `{ status }` | `UpdateTransactionStatusRequest { status }` |
| `POST /transactions/{id}/verify-otp` | `{ otp }` | `TransactionVerifyOtpRequest { otp }` |
| `POST /transactions/{id}/dispute` | `{ reason }` | `DisputeTransactionRequest { reason }` |
| `POST /auth/forgot-password` | `{ email }` | `ForgotPasswordRequest` |
| `POST /auth/reset-password` | `{ token, newPassword }` | `ResetPasswordRequest` |
| `GET /public/users/{userId}` | — | `PublicUserProfileResponse` |
| `GET /admin/transactions/disputed` | — | `List<TransactionResponse>` |
| `PATCH /admin/transactions/{id}/resolve` | `{ resolution, adminNote? }` | `AdminResolveTransactionRequest` |
| `POST /reviews` | `{ targetUserId, transactionId, rating, content, productId? }` | `CreateReviewRequest` |

---

## 6. ROADMAP

| Version | Nội dung | Status |
|---------|---------|--------|
| v0.5.0 | 5 module BE: Refresh Token, CORS, Rate Limit, WebSocket, Notification | ✅ Done |
| v0.6.0 | Fix FE: status uppercase, OTP flow, mock bypass | ✅ Done |
| v0.6.1 | Fix BE↔FE sync: field names, OTP impl, TransactionProductDto | ✅ Done |
| v0.6.2 | FE: TransactionGuidePage v2, nội quy v2 | ✅ Done |
| v0.6.3 | Sprint 2: forgot/reset, dispute + admin resolve, public profile, MailService/SMTP | ✅ Done |
| v0.7.0 | OTP guard nâng cao, FE skeleton UI (còn lại) | 📋 Planned |
| v1.0.0 | Production release | 📋 Planned |

---

## 7. CHANGELOG

### [0.6.3] — 2026-03-21 — Sprint 2 (missing features)

**Added (BE)**
- `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` (token 1h, link `APP_FRONTEND_BASE_URL/auth?resetToken=…`)
- `MailService` + gửi OTP đăng ký / resend OTP / quên mật khẩu khi cấu hình `spring.mail.*`
- `POST /api/transactions/{id}/dispute` (buyer, `MEETING` → `DISPUTED`); chặn `DISPUTED` qua `PATCH …/status`
- `GET /api/admin/transactions/disputed`, `PATCH /api/admin/transactions/{id}/resolve` (`COMPLETED` | `CANCELLED`)
- `GET /api/public/users/{userId}` + `PublicUserProfileResponse` (rating + 10 review gần nhất)
- Flyway `V7`: `dispute_reason`, `disputed_at` trên `transactions`

**Added (FE)**
- `AuthPage`: gọi API quên/đặt lại mật khẩu; đọc `resetToken` từ query; mật khẩu mới tối thiểu 8 ký tự
- `GuestRoute`: cho phép `/auth?resetToken=` khi đã đăng nhập
- `TransactionDetailPage`: báo tranh chấp (buyer, MEETING); hiển thị trạng thái DISPUTED
- `AdminPage` → Giao dịch: khối xử lý tranh chấp + gọi admin API
- `UserPublicProfilePage` + route `/users/:id`; `ProductDetailPage` link tới hồ sơ người bán
- `endpoints.js`: `openDispute`, `getDisputedTransactions`, `resolveDisputedTransaction`, `publicProfileApi`

### [0.6.2] — 2026-03-22 — TransactionGuidePage v2

**Changed (FE)**
- `TransactionGuidePage.jsx`: 6 bước → 7 bước
  - Bước 5 OTP: làm rõ buyer tạo mã / seller nhập mã, không làm ngược
  - Bước 6 (mới): Báo tranh chấp — hướng dẫn dùng trước khi đưa OTP
  - Bước 7: Đánh giá — cập nhật tip điểm uy tín người mới
- RULES: 3 mục → 4 mục (thêm Vi phạm & Xử lý)
- FAQS: 5 câu → 6 câu (thêm ai tạo OTP + điểm uy tín người mới)
- Flow diagram: thêm node `🔍 Tranh chấp` (DISPUTED) vào nhánh phụ
- Điểm uy tín mặc định: bỏ 5.0 → "Chưa có đánh giá"

### [0.6.1] — 2026-03-22 — BE↔FE Sync fixes

**Fixed (FE)**
- `vite.config.js`: proxy default → port 8080 (was 8081)
- `AuthContext.jsx`: `verifyOtp` gửi đúng `{ email, otp }`
- `AuthContext.jsx`: `verifyPhone` gửi đúng `{ phone }`
- `AuthContext.jsx`: `socialLogin` gửi đúng `{ provider, token }`
- `ProductDetailPage.jsx`: `status.toUpperCase() === 'SOLD'`

**Fixed (BE)**
- `AuthServiceImpl.java`: implement `verifyOtp` thực, lưu OTP trong DB
- `TransactionResponse.java` + `TransactionServiceImpl.java`: thêm `description`, `category`

### [0.6.0] — 2026-03-22

**Fixed (FE)**
- `AuthContext`: isAdmin → `.toUpperCase() === 'ADMIN'`; xóa mock bypass
- `TransactionDetailPage`: STATUS_CONFIG keys → UPPERCASE
- `endpoints.js`: thêm verifyOtp/resendOtp/socialLogin/verifyPhone
- `AuthPage`: thêm OTP step sau register
- `Navbar`: fix crash khi notifications null

**Added (FE)**
- `ErrorBoundary.jsx`, `utils/safeSession.js`, `utils/safeStorage.js`
- `NotificationContext.jsx` (STOMP + 30s poll), `websocket.js`

### [0.5.0] — 2026-03-21
- Module 1–5 BE: Refresh Token, CORS, Rate Limiting, WebSocket Chat, Notification System

### [0.4.0] — 2026-03-17
- Gộp frontend + backend repo vào monorepo `trhlow/EDUCYCLE`

### [0.1.0–0.3.0] — 2026-03-14 đến 2026-03-16
- FE khởi tạo: Auth, Product CRUD, Transaction flow, Admin panel, Reviews, Social Login + OTP
- Migrate từ ASP.NET Core 10 + SQL Server → Java 17 + Spring Boot 3.2.5 + PostgreSQL

---

## 8. PROMPT AI

### Bắt đầu session mới
```
Đọc D:\EDUCYCLE\NOTES.md — phần 1 (trạng thái) và phần 2 (open tasks).
Tóm tắt: đã có gì, còn thiếu gì, việc tiếp theo là gì. Chưa cần code.
```

### Fix bug / Implement feature
```
Đọc D:\EDUCYCLE\NOTES.md phần 1, 5 (rules + field mapping), 9 (design nếu liên quan UI).
Task: [mô tả]
Yêu cầu: code đầy đủ, không placeholder, file SỬA chỉ ra cũ→mới, file MỚI viết toàn bộ.
```

### Implement UI từ Figma / thiết kế mới
```
Đọc D:\EDUCYCLE\NOTES.md phần 9 (UI Design Rules) trước khi viết bất kỳ CSS hay JSX nào.
Task: [mô tả screen/component]
```

### Commit và push
```
Đọc D:\EDUCYCLE\NOTES.md phần 4 (git workflow).
Tôi vừa sửa: [liệt kê files]
Tạo commit message đúng convention, stage đúng files, push lên dev.
```

### Debug FE↔BE mismatch
```
Đọc D:\EDUCYCLE\NOTES.md phần 5 (FE↔BE field mapping table).
Lỗi: [paste lỗi 400/500] — Endpoint: [POST/GET /api/...]
Kiểm tra xem FE đang gửi đúng field name theo BE DTO record chưa.
```

### Cập nhật nội quy / hướng dẫn giao dịch
```
Bạn là developer của EduCycle. Đọc file hiện tại:
  source/frontend/src/pages/TransactionGuidePage.jsx

Nguyên tắc bắt buộc trước khi sửa:
  1. CHỈ sửa nội dung data (STEPS, RULES, FAQS) — KHÔNG thay đổi JSX, CSS, structure.
  2. Tất cả status phải UPPERCASE: PENDING, ACCEPTED, MEETING, COMPLETED, DISPUTED,
     REJECTED, CANCELLED.
  3. OTP flow chuẩn: buyer tạo mã → seller nhập mã (không làm ngược).
     Guard BE: chỉ buyer gọi generateOtp, chỉ seller gọi verifyOtp.
  4. DISPUTED chỉ được trigger khi status = MEETING và người gọi là buyer,
     thực hiện TRƯỚC KHI đưa OTP.
  5. Điểm uy tín người mới = "Chưa có đánh giá" (không phải 5.0).
  6. CSS token dùng var(--warning-light) / #e65100 cho DISPUTED
     (class .guide-flow-disputed đã có trong TransactionGuidePage.css).
  7. Tuân thủ design tokens từ source/frontend/src/styles/tokens.css —
     không hardcode màu hex, không dùng font-weight 600/700.

Transaction status flow đầy đủ:
  PENDING → ACCEPTED → MEETING → COMPLETED
                      ↘ DISPUTED (buyer báo tại điểm gặp, trước OTP)
           ↘ REJECTED  (seller từ chối)
           ↘ CANCELLED (buyer hủy khi PENDING)

Thay đổi cần thực hiện:
  [mô tả thay đổi cụ thể ở đây]
```

### Sau khi xong task
1. Cập nhật bảng trạng thái (phần 1)
2. Move bug → phần 3, thêm vào Changelog (phần 7)
3. Thêm commit script vào phần 4 nếu cần

---

## 9. UI DESIGN RULES

> Nguồn: `source/frontend/src/styles/tokens.css` (169 biến CSS) + mockup đã duyệt.
> AI đọc phần này trước khi viết bất kỳ CSS, JSX, hay layout nào.

### 9.1 Design Tokens — Nguồn sự thật duy nhất

File: `source/frontend/src/styles/tokens.css`

**Màu chính:**
```css
--primary-500: #2196f3;   /* màu chính — button, link, active */
--primary-700: #1976d2;   /* hover state */
--primary-900: #0d47a1;   /* text trên nền sáng */
--primary-50:  #e3f2fd;   /* nền nhẹ, badge, highlight */

--secondary-500: #4caf50; /* thành công, xác nhận */
--secondary-50:  #e8f5e9; /* nền badge success */

--accent-500: #ff9800;    /* cảnh báo, rating sao */
--accent-50:  #fff3e0;    /* nền badge warning */

--error:   #f44336;  --error-light:   #ffebee;
--warning: #ff9800;  --warning-light: #fff3e0;
--success: #4caf50;  --success-light: #e8f5e9;
--info:    #2196f3;  --info-light:    #e3f2fd;
```

**Màu nền & chữ:**
```css
--bg-primary:   #ffffff;
--bg-secondary: #f8f9fa;
--bg-tertiary:  #f0f2f5;

--text-primary:   #212121;
--text-secondary: #616161;
--text-tertiary:  #9e9e9e;

--border-light:  #e0e0e0;
--border-focus:  #2196f3;
```

**Typography:**
```css
--font-display: 'Poppins', system-ui;
--font-body:    'Inter', system-ui;
--font-mono:    'JetBrains Mono';

--text-xs: 0.75rem;   --text-sm: 0.875rem;  --text-base: 1rem;
--text-lg: 1.125rem;  --text-xl: 1.25rem;   --text-2xl: 1.5rem;
--text-3xl: 1.875rem;

--weight-regular: 400;
--weight-medium:  500;   /* KHÔNG dùng 600/700 */
```

**Spacing — 8pt grid:**
```css
--space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
--space-4: 1rem;    --space-6: 1.5rem;  --space-8: 2rem;
```

**Border Radius:**
```css
--radius-sm: 0.25rem;  --radius-md: 0.5rem;
--radius-lg: 0.75rem;  --radius-xl: 1rem;   --radius-full: 9999px;
```

---

### 9.2 Color Usage Rules

```css
/* ✅ ĐÚNG */
color: var(--text-primary);
background: var(--primary-50);
border: 0.5px solid var(--border-light);

/* ❌ SAI */
color: #212121;
background: #e3f2fd;
```

**Status badge pattern:**
```css
.status-pending   { background: var(--warning-light); color: #e65100; }
.status-accepted  { background: var(--info-light);    color: #1565c0; }
.status-meeting   { background: #e8eaf6;              color: #3949ab; }
.status-completed { background: var(--success-light); color: #2e7d32; }
.status-rejected  { background: var(--error-light);   color: #c62828; }
.status-cancelled { background: var(--bg-tertiary);   color: var(--text-secondary); }
.status-disputed  { background: var(--warning-light); color: #e65100; }
```

---

### 9.3 Component Patterns

**Card:**
```css
.card {
  background: var(--bg-primary);
  border: 0.5px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

**Button:**
```css
.btn-primary { background: var(--primary-500); color: #fff; border: none; border-radius: var(--radius-md); }
.btn-primary:hover { background: var(--primary-700); }
.btn-outline { background: transparent; color: var(--primary-500); border: 1.5px solid var(--primary-500); }
```

**Input:**
```css
.input {
  padding: var(--space-2) var(--space-3);
  border: 0.5px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
}
.input:focus { border-color: var(--border-focus); box-shadow: var(--shadow-focus); }
```

---

### 9.4 Responsive Layout

**Breakpoints (mobile-first):**
```
xs: 0–374px  |  sm: 375px+  |  md: 768px+  |  lg: 1024px+  |  xl: 1280px+
```

**Layout rules theo screen:**

| Screen | Mobile (< 768px) | Desktop (≥ 1024px) |
|--------|-----------------|-------------------|
| Navbar | Brand + icons only | Brand + nav links + icons |
| Navigation | Bottom tab bar (5 mục) | Sidebar (Dashboard/Admin) |
| Home | Stack dọc full-width | 2 cột: hero 50% + products 50% |
| Products | 2 cột grid, no sidebar | Sidebar 180px + 3 cột grid |
| Product Detail | Stack dọc | 2 cột: gallery + info |
| Post Product | Form dọc cuộn | 2 cột: thông tin + ảnh |
| Transactions | Cards dọc, scroll tabs | Full layout + filter |
| Tx Detail | Tabs Chat/OTP/Review | 2 cột: info + chat |
| Dashboard | Horizontal scroll tabs | Sidebar 190px + main |
| Admin | Horizontal scroll tabs | Sidebar 190px + bảng |
| Profile | Stack dọc | 2 cột: user + form |

**CSS pattern:**
```css
.layout { flex-direction: column; }        /* mobile default */

@media (min-width: 1024px) {
  .layout { flex-direction: row; }
  .sidebar { display: flex; }
  .bottom-nav { display: none; }
}
```

---

### 9.5 Screens & Navigation Flow

```
PUBLIC:  /  /auth  /products  /products/:id  /transactions/guide  /about  /contact
USER:    /products/new  /cart  /wishlist  /profile  /transactions  /transactions/:id
ADMIN:   /dashboard  /admin
```

**Transaction status flow (đầy đủ v0.6.2):**
```
PENDING → ACCEPTED → MEETING → COMPLETED
                    ↘ DISPUTED  (buyer báo tranh chấp tại điểm gặp, TRƯỚC khi đưa OTP)
         ↘ REJECTED             (seller từ chối)
         ↘ CANCELLED            (buyer hủy khi đang PENDING)
```

**OTP flow chuẩn:**
```
buyer.generateOtp()  →  mã 6 số hiện trên màn hình buyer
buyer đọc mã cho seller (tại chỗ)
seller.verifyOtp(mã)  →  COMPLETED + product SOLD
```

**Dispute flow:**
```
buyer thấy hàng sai mô tả  →  buyer.dispute(reason)  →  DISPUTED
Admin xem chat + ảnh  →  Admin.resolve(decision)  →  COMPLETED | CANCELLED
```

**TransactionDetail tabs:** Chat (STOMP realtime) · OTP (MEETING status) · Review (COMPLETED status)

---

### 9.6 Figma Variables Mapping

| CSS Token | Figma Variable | Giá trị |
|-----------|---------------|---------|
| `--primary-500` | `color/primary/default` | #2196f3 |
| `--primary-50` | `color/primary/subtle` | #e3f2fd |
| `--secondary-500` | `color/success/default` | #4caf50 |
| `--accent-500` | `color/warning/default` | #ff9800 |
| `--error` | `color/danger/default` | #f44336 |
| `--text-primary` | `color/text/primary` | #212121 |
| `--bg-primary` | `color/surface/default` | #ffffff |
| `--border-light` | `color/border/default` | #e0e0e0 |
| `--radius-lg` | `radius/card` | 12px |
| `--space-4` | `spacing/base` | 16px |

---

### 9.7 Asset Management

```
source/frontend/
├── public/          ← static assets (favicon...)
└── src/
    ├── styles/
    │   └── tokens.css   ← design system duy nhất
    └── pages/
        └── *.css        ← CSS scoped per page
```

**Image fallback pattern:**
```jsx
<img
  src={product.imageUrl || '/placeholder-book.png'}
  alt={product.name}
  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
/>

{/* Avatar fallback */}
{user.avatar
  ? <img src={user.avatar} alt={user.username} />
  : <div className="avatar">{user.username[0].toUpperCase()}</div>
}
```
