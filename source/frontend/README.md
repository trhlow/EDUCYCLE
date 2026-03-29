📍 Vị trí trong monorepo: `source/frontend/`

# 🎓 EduCycle Frontend

<h1 align="center">EduCycle</h1>

<p align="center">
  <strong>Trao Đổi Sách. Kết Nối Sinh Viên. Tái Sử Dụng Tri Thức.</strong><br/>
  <em>Nền tảng P2P giúp sinh viên mua bán sách giáo trình, tài liệu ôn thi & dụng cụ học tập — an toàn, minh bạch, bền vững.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61dafb?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7.3-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Router-v7-ca4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router" />
  <img src="https://img.shields.io/badge/Axios-JWT_Auth-5a29e4?style=flat-square&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/CSS-Design_Tokens-1572b6?style=flat-square&logo=css3&logoColor=white" alt="CSS Tokens" />
  <img src="https://img.shields.io/badge/License-Private-red?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> ·
  <a href="#-tính-năng">Tính Năng</a> ·
  <a href="#-kiến-trúc">Kiến Trúc</a> ·
  <a href="#-quy-trình-giao-dịch">Quy Trình</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-đóng-góp">Đóng Góp</a>
</p>

---

## 🔥 What's New

| Date | Version | Highlights |
|---|---|---|
| **17/03/2026** | `v0.4.0` | 🔒 **Security Hardening** — Removed mock auth bypass, added CSP headers, ErrorBoundary, fixed route conflicts. Production-safe auth flow. |
| **16/03/2026** | `v0.3.0` | ⭐ **User-to-User Reviews** — Shopee-style đánh giá sau giao dịch, lọc người bán theo uy tín. |
| **15/03/2026** | `v0.2.0` | 🔐 **OAuth & OTP** — Social login (Google/Facebook/Microsoft), email OTP verification, phone verification trên Profile. |
| **14/03/2026** | `v0.1.0` | 🚀 **Initial Release** — 16 pages, lazy-loaded SPA, P2P transaction flow với chat real-time & OTP confirmation. |

---

## 🛠️ Công Nghệ

| Layer | Stack |
|-------|-------|
| **Framework** | React 19.2 + Vite 7 |
| **Language** | JavaScript (JSX) |
| **Routing** | React Router v7.13 |
| **State** | React Context API (Auth, Cart, Wishlist) |
| **HTTP Client** | Axios 1.13 |
| **Styling** | Pure CSS + CSS Variables (Design Tokens) |
| **Code Splitting** | React.lazy + Suspense — mỗi page 1 chunk |
| **Backend** | Java 17 + Spring Boot 3.2.5 + PostgreSQL + JWT |
| **Proxy** | Vite dev: `/api` + `/ws` → `VITE_DEV_PROXY_TARGET` (mặc định **8081**, đồng bộ Spring profile `docker`) |

---

## 📂 Cấu Trúc Dự Án

```
src/
├── api/
│   ├── axios.js              # Axios instance + JWT interceptor
│   └── endpoints.js          # authApi, productsApi, categoriesApi,
│                              # transactionsApi, messagesApi, reviewsApi, adminApi
├── components/
│   ├── PageLoader.jsx/.css   # Loading screen (React.lazy fallback)
│   ├── ProtectedRoute.jsx    # Route guard (auth + adminOnly)
│   ├── Toast.jsx/.css        # Toast notification system
│   └── layout/
│       ├── Layout.jsx/.css   # App shell + Footer
│       └── Navbar.jsx/.css   # Top navigation bar
├── contexts/
│   ├── AuthContext.jsx       # JWT auth + /users/me + đổi mật khẩu (no mock)
│   └── WishlistContext.jsx   # Yêu thích (localStorage)
├── pages/                    # 16 pages — tất cả lazy-loaded
│   ├── HomePage.jsx          # Landing page
│   ├── AuthPage.jsx          # Đăng nhập / Đăng ký
│   ├── ProductListingPage.jsx # Danh sách sản phẩm + bộ lọc
│   ├── ProductDetailPage.jsx  # Chi tiết + đánh giá + yêu cầu mua
│   ├── PostProductPage.jsx    # Form đăng bán (categories từ API)
│   ├── TransactionsPage.jsx   # Danh sách giao dịch + nội quy
│   ├── TransactionDetailPage.jsx # Chat + OTP + đánh giá
│   ├── TransactionGuidePage.jsx  # Hướng dẫn quy trình
│   ├── DashboardPage.jsx     # Dashboard cá nhân (API thực)
│   ├── AdminPage.jsx         # Quản trị viên (API thực)
│   ├── ProfilePage.jsx       # Hồ sơ cá nhân
│   ├── WishlistPage.jsx      # Danh sách yêu thích
│   ├── CartPage.jsx          # P2P: không giỏ — hướng dẫn + link giao dịch
│   ├── AboutPage.jsx         # Giới thiệu
│   ├── ContactPage.jsx       # Liên hệ
│   └── NotFoundPage.jsx      # 404
├── styles/
│   └── tokens.css            # CSS Design Tokens
├── App.jsx                   # Routes + Suspense wrapper
├── main.tsx                  # Entry + QueryProvider + Context Providers
├── providers/
│   └── QueryProvider.tsx     # TanStack Query (Sprint 5+)
└── index.css                 # Global styles
```

---

## 🔗 Tích Hợp Backend

Frontend giao tiếp với Java Spring Boot qua Vite proxy (dev):

```
Frontend /api/*  →  {VITE_DEV_PROXY_TARGET}/api/*   (mặc định http://localhost:8081)
Frontend /ws    →  {VITE_DEV_PROXY_TARGET}/ws      (SockJS + STOMP chat)
```

`VITE_DEV_PROXY_TARGET` lấy từ `.env.development` (repo) hoặc `.env.local` (override local).  
Chạy backend **không** profile docker (port **8080**): tạo `.env.local` với `VITE_DEV_PROXY_TARGET=http://localhost:8080`.

### API Endpoints đã tích hợp

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /auth/register`, `POST /auth/login` |
| **Products** | `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`, `GET /products/mine`, `GET /products/pending`, `GET /products/admin/all`, `PATCH /products/:id/approve`, `PATCH /products/:id/reject` |
| **Categories** | `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` |
| **Transactions** | `GET /transactions`, `GET /transactions/mine`, `GET /transactions/:id`, `POST /transactions`, `PATCH /transactions/:id/status`, `POST /transactions/:id/otp`, `POST /transactions/:id/verify-otp`, `POST /transactions/:id/confirm` |
| **Messages** | `GET /transactions/:id/messages`, `POST /transactions/:id/messages` |
| **Reviews** | `GET /reviews`, `POST /reviews`, `DELETE /reviews/:id`, `GET /reviews/product/:productId` |
| **Admin** | `GET /admin/stats`, `GET /admin/users` |

### Backend Data Shapes

```
AuthResponse     → { userId, username, email, token, role }
ProductResponse  → { id, name, description, price, imageUrl, imageUrls, category,
                     categoryName, categoryId, condition, contactNote, sellerId,
                     sellerName, status, averageRating, reviewCount, createdAt }
TransactionResponse → { id, buyer: {id, username, email},
                         seller: {id, username, email},
                         product: {id, name, price, imageUrl},
                         amount, status, createdAt }
ReviewResponse   → { id, userId, username, productId, rating, content, createdAt }
MessageResponse  → { id, transactionId, senderId, senderName, content, createdAt }
```

---

## 🚀 Cài Đặt & Chạy

### Yêu cầu

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Backend** khuyến nghị: profile **`docker`** tại `http://localhost:8081` (+ `docker compose` Postgres **5433**). Hoặc default **8080** nếu chỉ `mvn spring-boot:run` — khi đó chỉnh `VITE_DEV_PROXY_TARGET` như trên.

### Clone & install

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE/source/frontend
npm install

# 2. Configure (optional)
#    Copy .env.example → .env.local nếu cần đổi cổng proxy
#    Mặc định: VITE_DEV_PROXY_TARGET=http://localhost:8081 (profile docker)
#    Tùy chọn tuyệt đối: VITE_API_URL=http://localhost:8081/api

# 3. Run
npm run dev
```

Truy cập → **[http://localhost:5173](http://localhost:5173)** — Tự động proxy API requests đến backend.

**Production (Docker):** từ thư mục gốc monorepo chạy `docker compose up --build` — image FE build bằng `Dockerfile` + `nginx.conf` (proxy `/api`, `/ws`). Chi tiết: `README.md` ở root repo.

> **Yêu cầu**: Node.js ≥ 18 · Backend chạy tại cổng trùng `VITE_DEV_PROXY_TARGET` (mặc định **8081** / profile `docker`)

---

## 🎯 Tính Năng

### 🔐 Xác Thực Đa Tầng

| Tính năng | Mô tả |
|---|---|
| **Email & Mật Khẩu** | Đăng ký → OTP 6 số qua email → Xác thực → Đăng nhập |
| **Social Login** | Microsoft (`.edu.vn` ưu tiên), Google, Facebook — OAuth 2.0 redirect |
| **JWT + Interceptor** | Token tự động gắn vào mọi request, 401 → redirect `/auth` |
| **Privacy Masking** | Tên người dùng tự động mã hoá trên trang công khai: `NguyenVanA` → `Ngu***A` |

### 🛍️ Giao Dịch P2P Thông Minh

```
📩 Gửi Yêu Cầu  →  ✅ Chấp Nhận  →  💬 Chat & Hẹn  →  🔐 OTP Xác Nhận  →  🎉 Hoàn Thành
                     ❌ Từ Chối                          📦 Xác Nhận Nhận
                     🚫 Hủy                               ⭐ Đánh Giá
```

| Tính năng | Mô tả |
|---|---|
| **5-Step Flow** | Pending → Accepted → Meeting → OTP Verify → Completed |
| **In-App Chat** | Nhắn tin real-time giữa buyer & seller — không chia sẻ SĐT |
| **OTP Confirmation** | Seller tạo OTP → Buyer nhập mã tại điểm gặp → Cả hai xác nhận |
| **Auto-Delist** | Sản phẩm tự động gỡ khỏi sàn sau giao dịch thành công |
| **User Reviews** | Đánh giá 1–5★ sau giao dịch — lịch sử uy tín hiện trên trang sản phẩm |

### 📚 Marketplace

| Tính năng | Mô tả |
|---|---|
| **Smart Search** | Tìm kiếm + lọc theo danh mục, khoảng giá, đánh giá tối thiểu |
| **Dual View** | Grid hoặc List view — tuỳ chọn người dùng |
| **Category Filter** | Giáo Trình, Sách Chuyên Ngành, Tài Liệu Ôn Thi, Dụng Cụ, Ngoại Ngữ |
| **Image Gallery** | Multi-image thumbnails trên trang chi tiết sản phẩm |
| **Wishlist** | Per-user, private — dữ liệu tách biệt theo `userId` |

### 🛡️ Bảo Mật & An Toàn

| Tính năng | Mô tả |
|---|---|
| **CSP Headers** | Content-Security-Policy chặn XSS, clickjacking, frame injection |
| **Error Boundary** | UI recovery khi component crash — không white-screen |
| **Route Guards** | `ProtectedRoute` (login required) + `GuestRoute` (redirect nếu đã login) + `adminOnly` |
| **401 Auto-Logout** | Token hết hạn → tự động clear session & redirect |

---

## 🏗️ Kiến Trúc

```
educycle-frontend/
├── index.html                  # SPA entry + CSP headers
├── vite.config.js              # Vite 7 + API proxy
├── package.json                # Dependencies & scripts
│
├── src/
│   ├── main.tsx                # Root: QueryProvider → ErrorBoundary → BrowserRouter → Providers → App
│   ├── providers/QueryProvider.tsx
│   ├── App.jsx                 # 16 lazy-loaded routes with Suspense + RouteTransition
│   │
│   ├── api/
│   │   ├── axios.js            # Axios instance + JWT interceptor + 401 handler
│   │   └── endpoints.js        # auth, users, products, categories, transactions,
│   │                           #   messages, reviews, notifications, admin
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Auth + refreshUser/saveProfile/changePassword
│   │   └── WishlistContext.jsx # Per-user wishlist + localStorage keyed by userId
│   │
│   ├── components/
│   │   ├── ErrorBoundary.jsx   # Catch-all error recovery UI
│   │   ├── ProtectedRoute.jsx  # Auth guards (ProtectedRoute + GuestRoute)
│   │   ├── RouteTransition.jsx # Page transition animation bar
│   │   ├── PageLoader.jsx      # Suspense fallback spinner
│   │   ├── Toast.jsx           # Toast notification system
│   │   └── layout/
│   │       ├── Layout.jsx      # App shell: Navbar + <Outlet> + Footer
│   │       └── Navbar.jsx      # Responsive nav with user dropdown
│   │
│   ├── pages/                  # 16 page components (all lazy-loaded)
│   │   ├── HomePage.jsx        # Landing: hero, stats, features, testimonials, CTA
│   │   ├── AuthPage.jsx        # Login/Register tabs + OTP modal + Social login
│   │   ├── ProductListingPage  # Search + filters + grid/list view
│   │   ├── ProductDetailPage   # Gallery + purchase panel + reviews + tabs
│   │   ├── PostProductPage     # Multi-step product creation form
│   │   ├── TransactionsPage    # Transaction list with status badges
│   │   ├── TransactionDetail   # Chat + OTP + Review — full transaction lifecycle
│   │   ├── DashboardPage       # Admin overview + my products + sales history
│   │   ├── AdminPage           # Product approval + user management
│   │   ├── ProfilePage         # User settings + phone verification
│   │   ├── CartPage            # Shopping cart with quantity controls
│   │   ├── WishlistPage        # Saved items grid
│   │   └── ...                 # About, Contact, Guide, NotFound, OAuthCallback
│   │
│   ├── styles/
│   │   └── tokens.css          # 🎨 Design system: 169 CSS custom properties
│   │                           #    Colors (primary/secondary/accent/neutral/semantic)
│   │                           #    Typography (Plus Jakarta Sans; icons Phosphor)
│   │                           #    Spacing (8pt grid), Radius, Shadows, Transitions
│   │
│   └── utils/
│       └── maskUsername.js     # Privacy: "NguyenVanA" → "Ngu***A"
│
├── .env.development           # VITE_DEV_PROXY_TARGET=http://localhost:8081 (đồng bộ docker profile)
└── .env.example               # Mẫu + gợi ý VITE_API_URL
```

---

## 🔄 Quy Trình Giao Dịch

EduCycle sử dụng quy trình giao dịch **5 bước** đảm bảo minh bạch và an toàn cho cả người mua & người bán:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        EduCycle Transaction Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   BUYER                              SELLER                             │
│   ─────                              ──────                             │
│                                                                         │
│   📩 Gửi yêu cầu mua ──────────────→ ⏳ Nhận thông báo                │
│                                       ├── ✅ Chấp nhận                  │
│                                       └── ❌ Từ chối → [END]            │
│                                                                         │
│   💬 Chat hẹn địa điểm ←───────────→ 💬 Chat thống nhất               │
│                                                                         │
│   🤝 Bắt đầu gặp mặt ←────────────→ 🤝 Chuyển sang Meeting           │
│                                                                         │
│                                       🔑 Seller tạo OTP                │
│   🔐 Buyer nhập OTP    ──────────────→ ✅ Xác nhận OTP                 │
│   📦 Xác nhận nhận hàng                                                │
│                                                                         │
│   ⭐ Đánh giá Seller   ←───────────→ ⭐ Đánh giá Buyer                │
│                                                                         │
│   🎉 HOÀN THÀNH ─── Sản phẩm tự động gỡ khỏi sàn ─── 🎉              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Trạng thái giao dịch:**

| Status | Icon | Mô tả |
|---|---|---|
| `Pending` | ⏳ | Buyer đã gửi yêu cầu, chờ Seller phản hồi |
| `Accepted` | ✅ | Seller chấp nhận — chat mở, hẹn địa điểm |
| `Meeting` | 🤝 | Đang gặp mặt — OTP section mở |
| `Completed` | 🎉 | Cả hai xác nhận — giao dịch thành công |
| `Rejected` | ❌ | Seller từ chối yêu cầu |
| `Cancelled` | 🚫 | Buyer hủy yêu cầu |

---

## 🛠️ Tech Stack

### Frontend

| Layer | Technology | Version |
|---|---|---|
| **Core** | React | 19.2 |
| **Build** | Vite | 7.3 |
| **Routing** | React Router | 7.13 |
| **HTTP Client** | Axios | 1.13 |
| **State** | Context API | 3 providers (Auth, Cart, Wishlist) |
| **Design System** | CSS Custom Properties | 169 tokens |
| **Typography** | Plus Jakarta Sans ([Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans)) | Google Fonts |
| **Icons** | [Phosphor Icons](https://phosphoricons.com/) via `@phosphor-icons/react` | npm |

### Backend (Monorepo)

| Layer | Technology |
|---|---|
| **Framework** | Java 17 + Spring Boot 3.2.5 |
| **Database** | PostgreSQL + Flyway migrations |
| **ORM** | Spring Data JPA + Hibernate |
| **Auth** | JWT (JJWT) + Refresh Token + BCrypt |
| **WebSocket** | STOMP/SockJS (real-time chat + notifications) |
| **Rate Limiting** | Bucket4j (5/min auth, 60/min API) |

---

## 🎨 Design System

EduCycle sử dụng hệ thống **Design Token** hoàn chỉnh — không dependency UI framework nào:

```css
/* 🎨 Color Palette */
--primary-500: #2196f3;     /* Education Blue */
--secondary-500: #4caf50;   /* Success Green */
--accent-500: #ff9800;      /* Vibrant Orange */

/* 📐 Typography */
--font-display: 'Plus Jakarta Sans';  /* Headings + UI */
--font-body: 'Plus Jakarta Sans';      /* Body */

/* 📏 Spacing — 8pt Grid */
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-4: 1rem;
--space-8: 2rem;     --space-12: 3rem;    --space-16: 4rem;

/* 🌑 Shadows */
--shadow-sm → --shadow-xl   /* 5 levels */
--shadow-primary             /* Blue glow for CTAs */

/* ⚡ Animations */
@keyframes fadeIn, slideInUp, scaleIn, shimmer
```

> Xem toàn bộ tokens tại [`src/styles/tokens.css`](src/styles/tokens.css) — **169 custom properties** quản lý toàn bộ visual identity.

---

## 📜 Available Scripts

```bash
npm run dev          # 🔥 Start dev server (localhost:5173, hot reload)
npm run build        # 📦 Production build → dist/
npm run preview      # 👁️ Preview production build locally
npm run lint         # 🔍 ESLint check
```

---

## 📡 API Integration

Tất cả API calls đi qua một Axios instance duy nhất với **JWT interceptor** tự động:

```
┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Component   │────→│  endpoints  │────→│  axios instance  │
│  (useEffect) │     │  .js        │     │  + JWT Header    │
└──────────────┘     └─────────────┘     │  + 401 Handler   │
                                          └────────┬─────────┘
                                                   │
                                          ┌────────▼─────────┐
                                          │  Backend API     │
                                          │  localhost:8081   │
                                          │  (hoặc 8080)      │
                                          └──────────────────┘
```

**7 API Namespaces:**

| Namespace | Endpoints | Auth Required |
|---|---|---|
| `authApi` | login, register, verifyOtp, resendOtp, verifyPhone, socialLogin | ❌ |
| `productsApi` | CRUD + getMyProducts + admin approve/reject | Partial |
| `categoriesApi` | CRUD categories | Partial |
| `transactionsApi` | CRUD + status update + OTP generate/verify + confirm | ✅ |
| `messagesApi` | getByTransaction, send | ✅ |
| `reviewsApi` | CRUD + getByUser/Product/Transaction + createUserReview | ✅ |
| `adminApi` | getStats, getUsers | ✅ Admin |

---

## 🤝 Đóng Góp

Chúng tôi sử dụng quy trình **3-Branch Strategy**:

```
main ←── production release (stable)
  │
  dev ←── development (latest features)
    │
    v1.x.x ←── version snapshot
```

### Quy trình đóng góp

1. Checkout branch `dev` và pull code mới nhất
   ```bash
   git checkout dev && git pull origin dev
   ```
2. Tạo branch feature (nếu cần)
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```
3. Commit theo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(scope): mô tả tính năng"
   git commit -m "fix(scope): mô tả bug fix"
   ```
4. Push và tạo PR về `dev`
   ```bash
   git push origin feature/ten-tinh-nang
   ```

### Commit Convention

| Prefix | Khi nào dùng |
|---|---|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Cải thiện code không thay đổi behavior |
| `style` | CSS, formatting |
| `docs` | Documentation |
| `chore` | Build config, dependencies |

---

## 🗺️ Roadmap

| Phase | Timeline | Mục tiêu | Status |
|---|---|---|---|
| **v0.1** | Sprint 1–2 | Core SPA: Auth, Products, Cart, Dashboard | ✅ Done |
| **v0.2** | Sprint 3–4 | OAuth, OTP verification, phone verify | ✅ Done |
| **v0.3** | Sprint 5–6 | User-to-user reviews, transaction OTP, chat | ✅ Done |
| **v0.4** | Sprint 7 | Security hardening, ErrorBoundary, CSP | ✅ Done |
| **v0.5** | Sprint 8–9 | TanStack Query, debounce, testing (70%+) | 🔜 Next |
| **v0.6** | Sprint 10–11 | TypeScript migration, i18n, Storybook | 📋 Planned |
| **v1.0** | Sprint 12 | Production release, Docker, CI/CD | 📋 Planned |

---

## 📄 License

Dự án thuộc về **EduCycle Team**. Không sử dụng cho mục đích thương mại khi chưa có sự cho phép.

---

<p align="center">
  <strong>🎓 EduCycle</strong> — Trao đổi sách thông minh, kết nối sinh viên bền vững<br/><br/>
  <em>Built with ❤️ by <strong>EduCycle Team</strong> · Trà Vinh, Việt Nam</em>
</p>
