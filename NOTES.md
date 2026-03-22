# EduCycle — NOTES
> Một file duy nhất cho: trạng thái dự án, bugs, roadmap, git workflow, prompt AI, design rules.
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

### ✅ Đã fix (2026-03-21)

| # | Task | Files |
|---|------|-------|
| 1 | DashboardPage + TransactionsPage status UPPERCASE | `DashboardPage.jsx`, `TransactionsPage.jsx` |
| 2 | flyway-database-postgresql dependency | `pom.xml` |
| 3 | JWT secret → env variable | `application.yml` (đã có từ trước) |
| 4 | FE README .NET → Java Spring Boot | `README.md` |
| 5 | `updatedAt` thiếu → V4 migration | `Transaction.java`, `TransactionResponse.java`, `TransactionServiceImpl.java`, `V4__add_updated_at_to_transactions.sql` |
| 6 | Xóa 3 unused deps: react-hot-toast, react-icons, @tanstack/react-query | `package.json` |
| 7 | Tất cả pages dùng `useToast` từ Toast.jsx thay vì react-hot-toast | 10 page files |

### 🟡 Nợ kỹ thuật (không urgent)

| Issue | File | Impact |
|-------|------|--------|
| N+1 query trong `mapAllWithReviews` | `ProductServiceImpl.java` | Perf >50 sản phẩm |
| Social login buttons chưa kết nối | `AuthPage.jsx` | UX |

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
| 10 | DashboardPage TitleCase status | `DashboardPage.jsx` | `toUpperCase()` + UPPERCASE keys |
| 11 | TransactionsPage TitleCase status | `TransactionsPage.jsx` | STATUS_CONFIG + STATUS_FILTERS → UPPERCASE |
| 12 | flyway-database-postgresql | `pom.xml` | Thêm dependency |
| 13 | FE README sai stack .NET | `README.md` | → Java Spring Boot + 8080 |
| 14 | updatedAt thiếu "Invalid Date" | `Transaction.java` | `@UpdateTimestamp` + V4 migration |
| 15 | 3 unused npm deps | `package.json` | Xóa react-hot-toast, react-icons, @tanstack/react-query |
| 16 | react-hot-toast import sai | 10 page files | → `useToast` từ `Toast.jsx` |

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
- `DashboardPage`: status TitleCase → UPPERCASE (`completedTx`, `statusMap`, product status)
- `TransactionsPage`: STATUS_CONFIG + STATUS_FILTERS → UPPERCASE keys
- `endpoints.js`: thêm verifyOtp/resendOtp/socialLogin/verifyPhone
- `AuthPage`: thêm OTP step sau register
- `Navbar`: fix crash khi notifications null
- 10 pages: `react-hot-toast` → `useToast` từ `Toast.jsx` (consistent toast system)
- `README.md`: .NET/5171 → Java Spring Boot/8080

**Fixed (BE)**
- `pom.xml`: thêm `flyway-database-postgresql`
- `Transaction.java`: thêm `updatedAt` (`@UpdateTimestamp`) + V4 migration
- `TransactionResponse.java` + `TransactionServiceImpl.java`: trả `updatedAt` trong API

**Added (FE)**
- `ErrorBoundary.jsx`, `utils/safeSession.js`, `utils/safeStorage.js`
- `NotificationContext.jsx` (STOMP + 30s poll), `websocket.js`

**Removed (FE)**
- `react-hot-toast`, `react-icons`, `@tanstack/react-query` (unused deps)

### [0.5.0] — 2026-03-21
- Module 1–5 BE: Refresh Token, CORS, Rate Limiting, WebSocket Chat, Notification System

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
Đọc D:\EDUCYCLE\NOTES.md phần 1, 5 (rules), 9 (design rules nếu liên quan đến UI).
Task: [mô tả]
Yêu cầu: code đầy đủ, không placeholder, file SỬA chỉ ra cũ→mới, file MỚI viết toàn bộ.
```

### Implement UI từ Figma / thiết kế mới
```
Đọc D:\EDUCYCLE\NOTES.md phần 9 (UI Design Rules) trước khi viết bất kỳ CSS hay JSX nào.
Task: [mô tả screen/component]
Tuân thủ đúng design tokens, responsive breakpoints, và layout patterns đã định nghĩa.
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

---

## 9. UI DESIGN RULES

> Nguồn: `source/frontend/src/styles/tokens.css` (169 biến CSS) + mockup thiết kế đã duyệt.
> AI đọc phần này trước khi viết bất kỳ CSS, JSX, hay layout nào.

### 9.1 Design Tokens — Nguồn sự thật duy nhất

File: `source/frontend/src/styles/tokens.css`

**Màu chính:**
```css
/* Primary — Education Blue */
--primary-500: #2196f3;   /* màu chính — button, link, active */
--primary-700: #1976d2;   /* hover state */
--primary-900: #0d47a1;   /* text trên nền sáng */
--primary-50:  #e3f2fd;   /* nền nhẹ, badge, highlight */

/* Secondary — Success Green */
--secondary-500: #4caf50; /* thành công, xác nhận */
--secondary-50:  #e8f5e9; /* nền badge success */

/* Accent — Orange */
--accent-500: #ff9800;    /* cảnh báo, rating sao */
--accent-50:  #fff3e0;    /* nền badge warning */

/* Semantic */
--error:   #f44336;  --error-light:   #ffebee;
--warning: #ff9800;  --warning-light: #fff3e0;
--success: #4caf50;  --success-light: #e8f5e9;
--info:    #2196f3;  --info-light:    #e3f2fd;
```

**Màu nền & chữ:**
```css
--bg-primary:   #ffffff;   /* card, modal, input */
--bg-secondary: #f8f9fa;   /* page background */
--bg-tertiary:  #f0f2f5;   /* sidebar, section bg */

--text-primary:   #212121; /* tiêu đề, nội dung chính */
--text-secondary: #616161; /* label, phụ đề */
--text-tertiary:  #9e9e9e; /* placeholder, hint */

--border-light:  #e0e0e0;  /* default border */
--border-focus:  #2196f3;  /* input focus ring */
```

**Typography:**
```css
--font-display: 'Poppins', system-ui;  /* heading lớn */
--font-body:    'Inter', system-ui;    /* body, UI text */
--font-mono:    'JetBrains Mono';      /* OTP input, code */

/* Scale */
--text-xs: 0.75rem;   /* 12px — label nhỏ */
--text-sm: 0.875rem;  /* 14px — body nhỏ */
--text-base: 1rem;    /* 16px — body chính */
--text-lg: 1.125rem;  /* 18px — subtitle */
--text-xl: 1.25rem;   /* 20px — section title */
--text-2xl: 1.5rem;   /* 24px — page title */
--text-3xl: 1.875rem; /* 30px — hero */

/* Weight — chỉ dùng 2 mức */
--weight-regular: 400;
--weight-medium:  500;  /* button, label, heading */
/* KHÔNG dùng 600, 700 — quá nặng với UI flat */
```

**Spacing — 8pt grid:**
```css
--space-1: 0.25rem;  /* 4px  */
--space-2: 0.5rem;   /* 8px  */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

**Border Radius:**
```css
--radius-sm:   0.25rem;  /* 4px  — tag, badge */
--radius-md:   0.5rem;   /* 8px  — input, button */
--radius-lg:   0.75rem;  /* 12px — card */
--radius-xl:   1rem;     /* 16px — modal, panel */
--radius-full: 9999px;   /* pill, avatar */
```

---

### 9.2 Color Usage Rules

```css
/* ✅ ĐÚNG — dùng token */
color: var(--text-primary);
background: var(--primary-50);
border: 0.5px solid var(--border-light);

/* ❌ SAI — hardcode */
color: #212121;
background: #e3f2fd;
border: 1px solid #e0e0e0;
```

**Text trên nền màu — bắt buộc dùng cùng ramp:**
```css
/* Nền --primary-50 (#e3f2fd) → text phải dùng --primary-800 hoặc --primary-900 */
.badge-blue { background: var(--primary-50); color: var(--primary-900); }

/* KHÔNG dùng black (#000) hay var(--text-primary) trên nền màu */
```

**Status badge pattern:**
```css
.status-pending   { background: var(--warning-light); color: #e65100; }
.status-accepted  { background: var(--info-light);    color: #1565c0; }
.status-meeting   { background: #e8eaf6;              color: #3949ab; }
.status-completed { background: var(--success-light); color: #2e7d32; }
.status-rejected  { background: var(--error-light);   color: #c62828; }
.status-cancelled { background: var(--bg-tertiary);   color: var(--text-secondary); }
```

---

### 9.3 Component Patterns

**Card:**
```css
.card {
  background: var(--bg-primary);
  border: 0.5px solid var(--border-light);
  border-radius: var(--radius-lg);   /* 12px */
  padding: var(--space-4) var(--space-4);
}
/* KHÔNG dùng box-shadow trên card thường */
/* CHỈ dùng shadow khi hover hoặc modal */
```

**Button:**
```css
/* Primary */
.btn-primary {
  background: var(--primary-500);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
}
.btn-primary:hover { background: var(--primary-700); }

/* Outline */
.btn-outline {
  background: transparent;
  color: var(--primary-500);
  border: 1.5px solid var(--primary-500);
  border-radius: var(--radius-md);
}

/* Secondary/Ghost */
.btn-ghost {
  background: transparent;
  border: 0.5px solid var(--border-light);
  color: var(--text-primary);
}
```

**Input:**
```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 0.5px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color var(--duration-fast);
}
.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus); /* 0 0 0 3px rgba(33,150,243,.3) */
}
```

**Avatar:**
```css
.avatar {
  border-radius: var(--radius-full);
  background: var(--primary-500);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--weight-medium);
}
/* Sizes: 22px (xs) · 28px (sm) · 36px (md) · 48px (lg) · 60px (xl) */
```

**Stat card (dashboard):**
```css
.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}
.stat-value { font-size: var(--text-2xl); font-weight: var(--weight-medium); }
.stat-label { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px; }
```

---

### 9.4 Responsive Layout

**Breakpoints:**
```css
/* Mobile first */
/* xs: 0–374px   — single column */
/* sm: 375px+    — mobile target (iPhone standard) */
/* md: 768px+    — tablet, sidebar appears */
/* lg: 1024px+   — desktop, 2-column layouts */
/* xl: 1280px+   — wide desktop */
```

**Layout rules theo screen:**

| Screen | Mobile (< 768px) | Desktop (≥ 1024px) |
|--------|-----------------|-------------------|
| Navbar | Brand + icons only | Brand + nav links + icons |
| Navigation | Bottom tab bar (5 mục) | Sidebar (Dashboard/Admin) |
| Home | Stack dọc full-width | 2 cột: hero 50% + products 50% |
| Products | 2 cột grid, no sidebar | Sidebar 180px + 3 cột grid |
| Product Detail | Stack dọc | 2 cột: gallery 50% + info 50% |
| Post Product | Form dọc cuộn | 2 cột: thông tin + ảnh/ghi chú |
| Transactions | Cards dọc, scroll tabs | Full layout + filter |
| Tx Detail | Tabs: Chat / OTP / Review | 2 cột: info + chat panel |
| Dashboard | Horizontal scroll tabs | Sidebar 190px + main |
| Admin | Horizontal scroll tabs | Sidebar 190px + bảng |
| Profile | Stack dọc | 2 cột: user info + form |

**Bottom tab bar (mobile only):**
```jsx
/* Hiển thị khi màn hình < 768px, ẩn trên desktop */
/* 5 mục: Home · Tìm sách · Đăng bán (+) · Giao dịch · Cá nhân */
/* Tab active: color = var(--primary-500) */
/* Tab inactive: color = var(--text-secondary) */
```

**Sidebar (desktop only):**
```jsx
/* Hiển thị khi màn hình ≥ 768px */
/* Width: 190px, cố định trái */
/* Active link: background var(--primary-50), color var(--primary-900) */
```

**CSS pattern cho responsive:**
```css
/* Mobile first — viết mobile trước, override desktop sau */
.layout {
  display: flex;
  flex-direction: column;   /* mobile: stack dọc */
}

@media (min-width: 1024px) {
  .layout {
    flex-direction: row;    /* desktop: ngang */
  }
  .sidebar { display: flex; }   /* chỉ hiện trên desktop */
  .bottom-nav { display: none; } /* ẩn trên desktop */
}
```

---

### 9.5 Screens & Navigation Flow

**17 screens — phân quyền truy cập:**

```
PUBLIC (không cần đăng nhập):
  /              → HomePage
  /auth          → AuthPage (login + register + OTP)
  /products      → ProductListingPage
  /products/:id  → ProductDetailPage
  /transactions/guide → TransactionGuidePage
  /about         → AboutPage
  /contact       → ContactPage

PROTECTED (cần đăng nhập):
  /products/new       → PostProductPage
  /cart               → CartPage
  /wishlist           → WishlistPage
  /profile            → ProfilePage
  /transactions       → TransactionsPage
  /transactions/:id   → TransactionDetailPage

ADMIN ONLY:
  /dashboard → DashboardPage
  /admin     → AdminPage
```

**Transaction flow — 5 bước:**
```
PENDING → ACCEPTED → MEETING → COMPLETED
        → REJECTED (seller từ chối)
        → CANCELLED (buyer hủy)
```

**TransactionDetail — 3 tab:**
```
Chat    → STOMP WebSocket realtime (fallback HTTP polling)
OTP     → Seller tạo mã, Buyer nhập xác nhận → COMPLETED
Review  → Chỉ mở khi status = COMPLETED | hiện khi chưa đánh giá
```

---

### 9.6 Design Tokens → Figma Variables Mapping

Khi làm việc với Figma, map các token CSS sang Figma Variables:

| CSS Token | Figma Variable | Giá trị |
|-----------|---------------|---------|
| `--primary-500` | `color/primary/default` | #2196f3 |
| `--primary-50` | `color/primary/subtle` | #e3f2fd |
| `--secondary-500` | `color/success/default` | #4caf50 |
| `--accent-500` | `color/warning/default` | #ff9800 |
| `--error` | `color/danger/default` | #f44336 |
| `--text-primary` | `color/text/primary` | #212121 |
| `--text-secondary` | `color/text/secondary` | #616161 |
| `--bg-primary` | `color/surface/default` | #ffffff |
| `--bg-secondary` | `color/surface/subtle` | #f8f9fa |
| `--border-light` | `color/border/default` | #e0e0e0 |
| `--radius-lg` | `radius/card` | 12px |
| `--radius-md` | `radius/element` | 8px |
| `--space-4` | `spacing/base` | 16px |

**Icon:** Dùng emoji Unicode trực tiếp (không dùng icon library riêng).
Khi import từ Figma, thay các icon SVG bằng emoji tương đương:
```
search → 🔍  heart → ❤️  bell → 🔔  user → 👤  cart → 🛒
plus → +   check → ✓   close → ✕   menu → ☰
```

---

### 9.7 Asset Management

```
source/frontend/
├── public/          ← static assets (favicon, og-image...)
└── src/
    ├── styles/
    │   └── tokens.css   ← design system duy nhất
    └── pages/
        └── *.css        ← CSS scoped per page (không dùng CSS Modules)
```

**Image pattern:**
```jsx
/* Product image — luôn có fallback */
<img
  src={product.imageUrl || '/placeholder-book.png'}
  alt={product.name}
  onError={(e) => { e.target.src = '/placeholder-book.png'; }}
/>

/* Avatar — fallback bằng initial letter */
{user.avatar
  ? <img src={user.avatar} alt={user.username} />
  : <div className="avatar">{user.username[0].toUpperCase()}</div>
}
```
