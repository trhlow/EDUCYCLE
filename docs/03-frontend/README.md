📍 Vị trí trong monorepo: `source/frontend/`

# 🎓 EduCycle Frontend

> **Nền tảng trao đổi sách & tài liệu học tập P2P dành cho sinh viên**

EduCycle là ứng dụng web giúp sinh viên mua bán, trao đổi sách giáo trình, tài liệu ôn thi và dụng cụ học tập một cách trực tiếp, an toàn và minh bạch — không qua trung gian.

---

## ✨ Tính Năng Chính

| Tính năng | Mô tả |
|-----------|--------|
| 🔐 **Xác thực** | Đăng ký / Đăng nhập JWT, phân quyền User & Admin |
| 📚 **Duyệt sản phẩm** | Tìm kiếm, lọc theo danh mục (từ API), giá, đánh giá |
| 📝 **Đăng bán** | Form đầy đủ với preview ảnh, danh mục động, tình trạng sách |
| 📩 **Yêu cầu mua** | Tạo giao dịch P2P với `{productId, sellerId, amount}` |
| 🤝 **Quy trình giao dịch** | Yêu cầu → Chấp nhận → Gặp mặt → OTP → Hoàn thành |
| 🔒 **Xác nhận OTP** | Mã OTP do người bán tạo, người mua nhập để xác minh |
| 💬 **Chat nội bộ** | Tin nhắn real-time trong từng giao dịch |
| ⭐ **Đánh giá** | Hệ thống 1–5 sao với nội dung, gắn liền sản phẩm |
| 📋 **Nội quy** | Bắt buộc chấp thuận trước khi tham gia giao dịch |
| ❤️ **Yêu thích** | Lưu sản phẩm quan tâm vào danh sách |
| 📊 **Dashboard** | Tổng quan sản phẩm, giao dịch, doanh thu cá nhân |
| 🛡️ **Admin Panel** | Thống kê, quản lý users, sản phẩm, duyệt/từ chối, giao dịch |

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
| **Backend** | .NET Web API + SQL Server + JWT (repo riêng) |
| **Proxy** | Vite dev server → `http://localhost:5171/api` |

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
│   ├── AuthContext.jsx       # JWT auth + mock fallback khi offline
│   ├── CartContext.jsx       # Giỏ hàng (localStorage)
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
│   ├── CartPage.jsx          # Giỏ hàng
│   ├── AboutPage.jsx         # Giới thiệu
│   ├── ContactPage.jsx       # Liên hệ
│   └── NotFoundPage.jsx      # 404
├── styles/
│   └── tokens.css            # CSS Design Tokens
├── App.jsx                   # Routes + Suspense wrapper
├── main.jsx                  # Entry point + Context Providers
└── index.css                 # Global styles
```

---

## 🔗 Tích Hợp Backend

Frontend giao tiếp hoàn toàn với .NET Web API thông qua Vite proxy:

```
Frontend /api/*  →  http://localhost:5171/api/*
```

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
- **Backend** đang chạy tại `http://localhost:5171` (tùy chọn — có mock fallback)

### Clone & install

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE/source/frontend
npm install
```

### Chạy Development

```bash
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173)

### Build Production

```bash
npm run build
npm run preview
```

---

## 🔑 Tài Khoản Test

Khi backend **không chạy**, hệ thống tự động sử dụng mock auth:

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| **Admin** | `admin@educycle.com` | `123456` |
| **User** | Bất kỳ email | Bất kỳ mật khẩu |

Khi backend **đang chạy**, sử dụng tài khoản đã đăng ký trong hệ thống.

---

## 📋 Quy Trình Giao Dịch P2P

```
  Người mua gửi yêu cầu (productId + sellerId + amount)
                    ↓
  Người bán xác nhận  ←→  hoặc từ chối
                    ↓
  Chat nội bộ — thống nhất thời gian & địa điểm
                    ↓
  Chuyển trạng thái "Gặp mặt"
                    ↓
  Người bán tạo mã OTP  →  Người mua nhập OTP
                    ↓
  Người mua xác nhận nhận hàng
                    ↓
  Giao dịch hoàn thành  →  Đánh giá (1–5 ⭐)
```

**Trạng thái:** `Pending → Accepted → Meeting → Completed`
Ngoại lệ: `Rejected`, `Cancelled`, `Disputed`, `AutoCompleted`

---

## 🌿 Git Workflow

| Branch | Mục đích |
|--------|----------|
| `main` | Production — code ổn định |
| `dev` | Development — tích hợp features |
| `feature/*` | Feature branches từ dev |

### Quy trình:

```
feature/* → dev → main
```

---

## 📄 License

Đồ án tốt nghiệp đại học — Không sử dụng cho mục đích thương mại.

---

**Built with ❤️ by EduCycle Team**

**EduCycle** – *Trao đổi tài liệu sinh viên* 🎓
