# 🔍 PROJECT AUDIT — TRẠNG THÁI BUG & NỢ KỸ THUẬT
> Nguồn gốc: đọc trực tiếp source code sau khi build 5 module BE.
> Cập nhật: 2026-03-21 (cuối ngày).

---

## ✅ ĐÃ FIX (không cần làm lại)

| # | Bug/Issue | File | Ghi chú |
|---|-----------|------|---------|
| 1 | `isAdmin` luôn false | `AuthContext.jsx` | `=== 'Admin'` → `toUpperCase() === 'ADMIN'` |
| 2 | STATUS_CONFIG TitleCase | `TransactionDetailPage.jsx` | Keys đổi sang UPPERCASE, `statusKey` normalize |
| 3 | Mock bypass AuthContext | `AuthContext.jsx` | Xóa MOCK_ACCOUNTS + fallback logic |
| 4 | endpoints.js thiếu hàm | `endpoints.js` | Thêm verifyOtp/resendOtp/socialLogin/verifyPhone |
| 5 | AuthContext thiếu export | `AuthContext.jsx` | Export verifyOtp/resendOtp/socialLogin/verifyPhone |
| 6 | AuthPage thiếu OTP step | `AuthPage.jsx` | Form OTP sau register → verify → login |
| 7 | Navbar crash khi notif null | `Navbar.jsx` | `notifList = Array.isArray(notifications) ? ...` |
| 8 | ErrorBoundary thiếu | `main.jsx` | `ErrorBoundary.jsx` đã thêm và bọc app |
| 9 | safeSession/safeStorage | `utils/` | Tạo mới `safeSession.js` + `safeStorage.js` |

---

## ⚠️ CÒN MỞ — Cần fix

### 1. DashboardPage vẫn dùng TitleCase status
**File:** `source/frontend/src/pages/DashboardPage.jsx`

```javascript
// SAI — 3 chỗ cần sửa
['Completed', 'AutoCompleted'].includes(tx.status)  // → tx.status?.toUpperCase() === 'COMPLETED'
p.status === 'Approved'                              // → p.status?.toUpperCase() === 'APPROVED'

const statusMap = { Pending: '...', Accepted: '...' }  // → keys phải UPPERCASE
// Cách dùng: statusMap[tx.status?.toUpperCase()] || tx.status
```

### 2. flyway-database-postgresql thiếu trong pom.xml
**File:** `source/backend/educycle-java/pom.xml`

```xml
<!-- Thêm sau flyway-core -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```
Với Spring Boot 3.2.5, thiếu dep này → Flyway không migrate được PostgreSQL.

### 3. JWT secret hardcoded
**File:** `source/backend/educycle-java/src/main/resources/application.yml`

```yaml
# Đổi từ:
jwt:
  secret: THIS_IS_A_SUPER_SECRET_KEY_123456_MUST_BE_AT_LEAST_32_CHARS

# Thành:
jwt:
  secret: ${JWT_SECRET:THIS_IS_A_SUPER_SECRET_KEY_123456_MUST_BE_AT_LEAST_32_CHARS}
```
Tạo `.env` ở backend root: `JWT_SECRET=your-real-secret`, thêm `.env` vào `.gitignore`.

### 4. FE README.md còn ghi backend là .NET + sai port
**File:** `source/frontend/README.md`

```markdown
# Đổi:
| **Backend** | .NET Web API + SQL Server + JWT (repo riêng) |
| **Proxy**   | Vite dev server → http://localhost:5171/api  |

# Thành:
| **Backend** | Java Spring Boot 3.2 + PostgreSQL + JWT |
| **Proxy**   | Vite dev server → http://localhost:8080/api |
```

---

## 🟡 NỢ KỸ THUẬT (không urgent)

| # | Issue | File | Impact |
|---|-------|------|--------|
| A | Transaction thiếu `updatedAt` → "Invalid Date" | `Transaction.java` + V4 migration | UX |
| B | N+1 query trong `mapAllWithReviews` | `ProductServiceImpl.java` | Performance >50 sản phẩm |
| C | 5 npm deps cài không dùng | `package.json` | Bundle size |
| D | Social login buttons chưa kết nối thật | `AuthPage.jsx` | UX |

---

## 🚀 Commit cho các mục còn mở

```bash
cd D:\EDUCYCLE
git checkout dev && git pull origin dev

git add source/frontend/src/pages/DashboardPage.jsx
git add source/backend/educycle-java/pom.xml
git add source/backend/educycle-java/src/main/resources/application.yml
git add source/frontend/README.md

git commit -m "fix: dashboard status uppercase, flyway-postgresql dep, JWT env secret, FE README"
git push origin dev
```
