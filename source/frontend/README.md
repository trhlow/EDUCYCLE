<p align="center">
  <span style="font-size:3rem">🎓</span>
</p>

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

## ⚡ Quick Start

```bash
# 1. Clone & install
git clone https://github.com/trhlow/educycle-frontend.git
cd educycle-frontend
npm install

# 2. Configure
#    Edit .env — set your backend API URL
#    Default: VITE_API_URL=http://localhost:5171/api

# 3. Run
npm run dev
```

Truy cập → **[http://localhost:5173](http://localhost:5173)** — Tự động proxy API requests đến backend.

> **Yêu cầu**: Node.js ≥ 18 · Backend [educycle-backend](https://github.com/trhlow/educycle-backend) chạy tại `localhost:5171`

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
│   ├── main.jsx                # Root: ErrorBoundary → BrowserRouter → Providers → App
│   ├── App.jsx                 # 16 lazy-loaded routes with Suspense + RouteTransition
│   │
│   ├── api/
│   │   ├── axios.js            # Axios instance + JWT interceptor + 401 handler
│   │   └── endpoints.js        # 7 API namespaces (auth, products, categories,
│   │                           #   transactions, messages, reviews, admin)
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Auth state + login/register/OAuth/OTP/phone verify
│   │   ├── CartContext.jsx     # Cart state + localStorage persistence
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
│   │                           #    Typography (Inter + Poppins, 9 sizes, 6 weights)
│   │                           #    Spacing (8pt grid), Radius, Shadows, Transitions
│   │
│   └── utils/
│       └── maskUsername.js     # Privacy: "NguyenVanA" → "Ngu***A"
│
└── .env                       # VITE_API_URL=http://localhost:5171/api
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
| **Typography** | Inter + Poppins | Google Fonts |
| **Icons** | Emoji-native | No icon library dependency |

### Backend (Companion)

| Layer | Technology |
|---|---|
| **Framework** | ASP.NET Core 8 Web API |
| **Architecture** | Clean Architecture (Domain → Application → Infrastructure → API) |
| **Database** | SQL Server + Entity Framework Core |
| **Auth** | JWT Bearer + OAuth 2.0 (Google, Facebook, Microsoft) |
| **OTP** | Email-based 6-digit verification |

---

## 🎨 Design System

EduCycle sử dụng hệ thống **Design Token** hoàn chỉnh — không dependency UI framework nào:

```css
/* 🎨 Color Palette */
--primary-500: #2196f3;     /* Education Blue */
--secondary-500: #4caf50;   /* Success Green */
--accent-500: #ff9800;      /* Vibrant Orange */

/* 📐 Typography */
--font-display: 'Poppins';  /* Headings */
--font-body: 'Inter';       /* Body text */

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
                                          │  localhost:5171   │
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
  <em>Built with ❤️ by <strong>EduCycle Team</strong> · TP. Hồ Chí Minh, Việt Nam</em>
</p>
