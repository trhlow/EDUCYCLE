# EduCycle — NOTES
> Một file duy nhất cho: trạng thái dự án, bugs, roadmap, git workflow, prompt AI.
> Cập nhật mỗi khi xong task. AI rules chi tiết ở `.cursor/rules/educycle.mdc`.

---

## 1. TRẠNG THÁI DỰ ÁN

**Stack:** Java 17 + Spring Boot 3.2.5 + PostgreSQL + Flyway | React 19 + Vite 7 + Axios + STOMP

**Paths:** `source/backend/educycle-java/` (port 8080) · `source/frontend/` (port 5173)

**Branch hiện tại:** `dev` — v0.6.x

| Feature | BE | FE | Ghi chú |
|---------|----|----|---------|
| JWT Auth + Refresh Token | ✅ | ✅ | Rotation, V2 migration |
| CORS Whitelist | ✅ | — | CorsProperties + yml |
| Rate Limiting | ✅ | — | Bucket4j 5/min auth, 60/min API |
| WebSocket Chat | ✅ | ✅ | STOMP/SockJS, JWT auth |
| Notification System | ✅ | ✅ | DB + STOMP broadcast, 5 triggers |
| isAdmin + status uppercase | ✅ | ✅ | `toUpperCase() === 'ADMIN'` |
| OTP step sau register | ✅ | ✅ | Form OTP → verify → login |
| Mock bypass đã xóa | — | ✅ | Throw lỗi thật khi BE down |
| ErrorBoundary + safeSession | — | ✅ | Crash recovery + safe localStorage |

---

## 2. OPEN TASKS — Fix trước khi làm tính năng mới

### ⚠️ Cần fix (có code sẵn)

**1 · DashboardPage TitleCase status** — `source/frontend/src/pages/DashboardPage.jsx`
```javascript
// ĐỔI:
['Completed', 'AutoCompleted'].includes(tx.status)
p.status === 'Approved'
const statusMap = { Pending: '...', Accepted: '...' }

// THÀNH:
tx.status?.toUpperCase() === 'COMPLETED'
p.status?.toUpperCase() === 'APPROVED'
const statusMap = { PENDING: 'Chờ xác nhận', ACCEPTED: 'Đã chấp nhận', MEETING: 'Đang gặp mặt', COMPLETED: 'Hoàn thành', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy' }
// Dùng: statusMap[tx.status?.toUpperCase()] || tx.status
```

**2 · flyway-database-postgresql thiếu** — `source/backend/educycle-java/pom.xml`
```xml
<!-- Thêm sau flyway-core -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

**3 · JWT secret hardcoded** — `source/backend/educycle-java/src/main/resources/application.yml`
```yaml
jwt:
  secret: ${JWT_SECRET:THIS_IS_A_SUPER_SECRET_KEY_123456_MUST_BE_AT_LEAST_32_CHARS}
```

**4 · FE README sai stack** — `source/frontend/README.md`
```
.NET Web API + localhost:5171  →  Java Spring Boot + localhost:8080
```

### 🟡 Nợ kỹ thuật (không urgent)

| Issue | File | Impact |
|-------|------|--------|
| `updatedAt` thiếu → "Invalid Date" | `Transaction.java` + V4 migration | UX |
| N+1 query trong `mapAllWithReviews` | `ProductServiceImpl.java` | Perf >50 sản phẩm |
| 5 npm deps không dùng | `package.json` | Bundle size |
| Social login buttons chưa kết nối | `AuthPage.jsx` | UX |

### Commit cho open tasks
```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev
git add source/frontend/src/pages/DashboardPage.jsx
git add source/backend/educycle-java/pom.xml
git add source/backend/educycle-java/src/main/resources/application.yml
git add source/frontend/README.md
git commit -m "fix: dashboard status uppercase, flyway-postgresql, JWT env secret, FE README"
git push origin dev
```

---

## 3. BUGS ĐÃ FIX (không làm lại)

| # | Bug | File | Fix |
|---|-----|------|-----|
| 1 | `isAdmin` luôn false | `AuthContext.jsx` | `=== 'Admin'` → `toUpperCase() === 'ADMIN'` |
| 2 | STATUS_CONFIG TitleCase | `TransactionDetailPage.jsx` | Keys → UPPERCASE |
| 3 | Mock bypass | `AuthContext.jsx` | Xóa MOCK_ACCOUNTS + fallback |
| 4 | endpoints.js thiếu hàm | `endpoints.js` | Thêm verifyOtp/resendOtp/socialLogin/verifyPhone |
| 5 | AuthContext thiếu export | `AuthContext.jsx` | Export đủ 4 methods OTP |
| 6 | AuthPage thiếu OTP step | `AuthPage.jsx` | Form OTP sau register |
| 7 | Navbar crash notif null | `Navbar.jsx` | `Array.isArray()` defensive check |
| 8 | ErrorBoundary thiếu | `main.jsx` | Thêm `ErrorBoundary.jsx` |
| 9 | safeSession/safeStorage | `utils/` | Tạo mới 2 utils |

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
# Ví dụ
feat(be/auth): add refresh token with SecureRandom
fix(fe): normalize status uppercase in DashboardPage
security(be): move JWT secret to env variable
chore(fe): remove unused npm dependencies
```

### Workflow hàng ngày
```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev
# ... edit ...
git add <specific files>          # KHÔNG git add .
git commit -m "<type>(<scope>): <mô tả>"
git push origin dev
git log -1 --oneline              # verify
```

### Branch naming
```
feature/be-<n>  feature/fe-<n>  fix/<n>  docs/<n>
```

### Release
```powershell
# Verify trước
cd source\backend\educycle-java && mvn clean compile -q
cd source\frontend && npm run build

# Release
git checkout main && git pull origin main
git merge --no-ff dev -m "Release v0.7.0 — ..."
git push origin main
git tag -a v0.7.0 -m "v0.7.0: ..."
git push origin v0.7.0
```

### Không bao giờ commit
```
source/backend/educycle-java/target/
source/frontend/dist/
source/frontend/node_modules/
.env
```

---

## 5. RULES BẮT BUỘC

1. **Status UPPERCASE** — BE trả `"PENDING"` `"ADMIN"` `"APPROVED"` → FE dùng `.toUpperCase()`
2. **Flyway** — V1/V2/V3 không được sửa → thêm V4, V5...
3. **Token** — dùng `SecureRandom` 64 bytes, không `UUID.randomUUID()`
4. **CSS** — dùng `var(--token)` từ `tokens.css`, không hardcode hex
5. **AuthContext** — không có mock fallback, throw lỗi thật
6. **Git** — không `git add .`, stage từng file, dùng Conventional Commits

---

## 6. ROADMAP

| Version | Nội dung | Status |
|---------|---------|--------|
| v0.5.0 | 5 module BE: Refresh Token, CORS, Rate Limit, WebSocket, Notification | ✅ Done |
| v0.6.0 | Fix FE: status uppercase, OTP flow, mock bypass | 🔄 In Progress |
| v0.7.0 | FE: Skeleton UI, Dashboard user access, open tasks | 📋 Planned |
| v1.0.0 | Production release | 📋 Planned |

---

## 7. CHANGELOG

### [Unreleased] — v0.6.x

**Fixed (FE)**
- `AuthContext`: isAdmin → `toUpperCase() === 'ADMIN'`; xóa mock bypass
- `TransactionDetailPage`: STATUS_CONFIG keys → UPPERCASE
- `endpoints.js`: thêm verifyOtp/resendOtp/socialLogin/verifyPhone
- `AuthPage`: thêm OTP step sau register
- `Navbar`: fix crash khi notifications null

**Added (FE)**
- `ErrorBoundary.jsx`, `utils/safeSession.js`, `utils/safeStorage.js`
- `NotificationContext.jsx` (STOMP + 30s poll), `websocket.js`

### [0.5.0] — 2026-03-21
- Module 1: Refresh Token (SecureRandom, rotation, V2 migration)
- Module 2: CORS Whitelist (CorsProperties, yml)
- Module 3: Rate Limiting (Bucket4j, per-IP)
- Module 4: WebSocket Chat (STOMP, SockJS, JWT auth)
- Module 5: Notification System (V3 migration, STOMP broadcast)

### [0.4.0] — 2026-03-17
- Gộp frontend + backend repo vào monorepo `trhlow/EDUCYCLE`

### [0.1.0–0.3.0] — 2026-03-14 đến 2026-03-16
- FE khởi tạo: Auth, Product CRUD, Transaction flow, Admin panel, Reviews, Social Login + OTP

**Ghi chú kỹ thuật:**
- Migrate từ ASP.NET Core 10 + SQL Server → Java 17 + Spring Boot 3.2.5 + PostgreSQL
- BCrypt `$2a$` tương thích giữa BCrypt.Net-Next và BCryptPasswordEncoder
- Admin seed: `admin@educycle.com` / `admin@1` (BCrypt cost 11, trong V1 migration)

---

## 8. PROMPT AI

### Bắt đầu session mới
```
Đọc D:\EDUCYCLE\NOTES.md — phần 1 (trạng thái) và phần 2 (open tasks).
Tóm tắt: đã có gì, còn thiếu gì, việc tiếp theo là gì. Chưa cần code.
```

### Fix bug / Implement feature
```
Đọc D:\EDUCYCLE\NOTES.md phần 1 và 5 (rules).
Task: [mô tả]
Yêu cầu: code đầy đủ, không placeholder, file SỬA chỉ ra cũ→mới, file MỚI viết toàn bộ.
```

### Commit và push
```
Đọc D:\EDUCYCLE\NOTES.md phần 4 (git workflow).
Tôi vừa sửa: [liệt kê files]
Tạo commit message đúng convention, stage đúng files, push lên dev.
```

### Debug
```
Đọc D:\EDUCYCLE\NOTES.md phần 5 (rules) và phần 3 (bugs đã fix).
Lỗi: [paste lỗi] — File: [tên file nếu biết]
```

### Sau khi xong task
1. Cập nhật bảng trạng thái (phần 1)
2. Move bug từ "open tasks" → "đã fix" (phần 2 → 3)
3. Thêm vào Changelog (phần 7)
