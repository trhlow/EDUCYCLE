# 🎓 EduCycle Frontend

> Nền tảng trao đổi sách & tài liệu học tập giữa sinh viên (P2P)

EduCycle là ứng dụng web giúp sinh viên mua bán, trao đổi sách giáo trình, tài liệu ôn thi và dụng cụ học tập một cách trực tiếp, an toàn và tiện lợi.

## 📸 Tính Năng Chính

- **🔐 Đăng ký / Đăng nhập** — Xác thực JWT, phân quyền User/Admin
- **📚 Duyệt sản phẩm** — Tìm kiếm, lọc theo danh mục, giá, đánh giá
- **📝 Đăng bán tài liệu** — Form đăng bán với preview, hỗ trợ nhiều hình ảnh
- **📩 Gửi yêu cầu mua** — Giao dịch P2P trực tiếp giữa người mua và người bán
- **🤝 Quy trình giao dịch** — Yêu cầu → Chấp nhận → Gặp mặt → OTP → Hoàn thành
- **🔒 Xác nhận OTP** — Mã OTP bảo vệ mỗi giao dịch tại điểm giao nhận
- **💬 Chat nội bộ** — Trao đổi an toàn, không lộ thông tin cá nhân
- **⭐ Đánh giá uy tín** — Hệ thống đánh giá 1–5 sao sau mỗi giao dịch
- **📋 Nội quy giao dịch** — Bắt buộc chấp thuận trước khi giao dịch
- **❤️ Yêu thích** — Lưu sản phẩm quan tâm
- **👤 Trang cá nhân** — Quản lý hồ sơ, sản phẩm đã đăng
- **🛡️ Quản trị Admin** — Dashboard + Quản lý users/products/transactions

## 🛠️ Công Nghệ

| Layer | Stack |
|-------|-------|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router v7 |
| **State** | React Context API |
| **HTTP** | Axios |
| **Styling** | Pure CSS + CSS Variables (Design Tokens) |
| **Code Split** | React.lazy + Suspense (mỗi page 1 chunk) |
| **Backend** | .NET Web API + SQL Server (repo riêng) |

## 📂 Cấu Trúc Thư Mục

```
src/
├── api/                  # Axios instance + API endpoints
│   ├── axios.js
│   └── endpoints.js
├── components/           # Shared components
│   ├── PageLoader.jsx    # Loading screen với logo EduCycle
│   ├── ProtectedRoute.jsx
│   ├── Toast.jsx
│   └── layout/
│       ├── Layout.jsx    # App layout + Footer
│       └── Navbar.jsx    # Navigation bar
├── contexts/             # React Context providers
│   ├── AuthContext.jsx   # Auth + mock login fallback
│   ├── CartContext.jsx
│   └── WishlistContext.jsx
├── pages/                # Tất cả pages (lazy-loaded)
│   ├── HomePage.jsx
│   ├── AuthPage.jsx
│   ├── ProductListingPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── PostProductPage.jsx
│   ├── TransactionsPage.jsx
│   ├── TransactionDetailPage.jsx
│   ├── TransactionGuidePage.jsx
│   ├── ProfilePage.jsx
│   ├── DashboardPage.jsx
│   ├── AdminPage.jsx
│   └── ...
├── styles/
│   └── tokens.css        # CSS Design Tokens
├── App.jsx               # Routes + Suspense
├── main.jsx              # Entry point + Providers
└── index.css
```

## 🚀 Cài Đặt & Chạy

### Yêu cầu
- **Node.js** ≥ 18
- **npm** ≥ 9

### Cài đặt

```bash
git clone https://github.com/trhlow/educycle-frontend.git
cd educycle-frontend
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

## 🔑 Tài Khoản Test

Khi backend chưa chạy, hệ thống tự động dùng mock auth:

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| **Admin** | `admin@educycle.com` | `123456` |
| **User** | Bất kỳ email nào khác | Bất kỳ (≥ 6 ký tự) |

## 🔗 Kết Nối Backend

Frontend proxy API qua Vite:

```
/api → http://localhost:5171
```

Backend repo: .NET Web API + SQL Server (cần chạy riêng)

## 📋 Quy Trình Giao Dịch

```
Người mua gửi yêu cầu
        ↓
Người bán xác nhận / từ chối
        ↓
Chat thống nhất thời gian, địa điểm
        ↓
Gặp mặt → Người mua tạo OTP
        ↓
Người bán nhập OTP xác nhận
        ↓
Người mua xác nhận nhận hàng
        ↓
Giao dịch hoàn thành → Đánh giá
```

## 🌿 Git Workflow

| Branch | Mục đích |
|--------|----------|
| `main` | Production – code ổn định |
| `dev` | Development – tích hợp features |
| `feature/*` | Feature branches từ dev |

## 📄 License

Đồ án tốt nghiệp – Không sử dụng cho mục đích thương mại.

---

**EduCycle** – *Trao đổi tài liệu sinh viên* 🎓
