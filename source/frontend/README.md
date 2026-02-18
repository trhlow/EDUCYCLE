# 🎓 EduCycle Platform

> **Nền tảng trao đổi sách & tài liệu học tập P2P dành cho sinh viên**  
> *Kết nối - Chia sẻ - Tiết kiệm*

![EduCycle Banner](https://via.placeholder.com/1200x400?text=EduCycle+Platform)

**EduCycle** là giải pháp công nghệ giúp sinh viên các trường đại học mua bán, trao đổi giáo trình, sách chuyên ngành và dụng cụ học tập. Dự án tập trung vào tính **minh bạch**, **an toàn** và **trải nghiệm người dùng** tối ưu.

---

## ✨ Tính Năng Nổi Bật

### 🔐 Xác Thực & Bảo Mật
- **Đa kênh đăng nhập**: Hỗ trợ Email/Password, **Microsoft** (ưu tiên sinh viên `.edu.vn`), Google, Facebook.
- **Xác thực số điện thoại**: Bắt buộc xác thực OTP trước khi đăng bán sản phẩm để đảm bảo uy tín.
- **Bảo vệ quyền riêng tư**: Tự động mã hoá tên người dùng (ví dụ: `Ngu***A`) trên các trang công khai.

### 🛍️ Giao Dịch P2P Thông Minh
- **Quy trình khép kín**: Yêu cầu → Chấp nhận → Gặp mặt → Xác thực OTP → Hoàn tất.
- **Auto-Delete Product**: Sản phẩm tự động ẩn khỏi sàn ngay khi giao dịch thành công.
- **Chat Real-time**: Trao đổi trực tiếp giữa người mua và người bán.

### ⭐ Hệ Thống Đánh Giá User-to-User
- **Đánh giá Uy tín**: Người mua và người bán đánh giá lẫn nhau sau mỗi giao dịch.
- **Lịch sử minh bạch**: Xem lịch sử đánh giá của đối tác trước khi giao dịch.

---

## 🛠️ Tech Stack

### Frontend (`/educycle-frontend`)
- **Core**: React 19, Vite 7
- **Routing**: React Router v7
- **State Management**: Context API
- **Styling**: Pure CSS Variables (Tokens), Responsive Design
- **HTTP**: Axios (Interceptor, Auth Header)

### Backend (`/educycle-backend`)
- **Framework**: ASP.NET Core 8 Web API
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, API)
- **Database**: SQL Server, Entity Framework Core
- **Authentication**: JWT Bearer, OAuth 2.0 (Social)

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Khởi chạy Backend
Đảm bảo bạn đã cài đặt .NET 8 SDK và SQL Server.

```bash
# Di chuyển vào thư mục API
cd ../educycle-backend/EduCycle.Api

# Cấu hình ConnectionString trong appsettings.Development.json

# Chạy Migrations (Cập nhật DB)
dotnet ef database update

# Khởi chạy Server
dotnet run
# Server sẽ chạy tại: http://localhost:5171
```

### 2. Khởi chạy Frontend
Yêu cầu Node.js >= 18.

```bash
# Di chuyển vào thư mục Frontend
cd ../educycle-frontend

# Cài đặt dependencies
npm install

# Chạy Development Server
npm run dev
```

Truy cập: [http://localhost:5173](http://localhost:5173)

---

## 📂 Cấu Trúc Dự Án Frontend

```
src/
├── api/            # API endpoints & Axios config
├── components/     # Reusable components (Toast, Modal, Loader...)
├── contexts/       # Global state (Auth, Cart...)
├── pages/          # Page components (Lazy loaded)
│   ├── AuthPage.jsx           # Login/Register/Social
│   ├── PostProductPage.jsx    # Đăng tin + Verify Phone
│   ├── ProductDetailPage.jsx  # Chi tiết + Reviews
│   ├── TransactionDetailPage.jsx # Giao dịch + OTP
│   └── ...
├── styles/         # Global styles & Design Tokens
└── utils/          # Helpers (Masking, Formatting...)
```

---

## 🤝 Quy Trình Đóng Góp (Contribution)

Chúng tôi sử dụng quy trình **Git Flow** đơn giản hoá:

1.  **Main Branch**: `dev` (Code mới nhất đang phát triển)
2.  **Feature Branch**: `feature/ten-tinh-nang`

**Các bước đóng góp:**
1.  Checkout branch `dev` và pull code mới nhất: `git checkout dev && git pull`
2.  Tạo branch mới: `git checkout -b feature/tinh-nang-moi`
3.  Commit changes: `git commit -m "feat: mô tả tính năng"`
4.  Push lên remote: `git push origin feature/tinh-nang-moi`
5.  Tạo Pull Request (PR) về branch `dev`.

---

## 📄 License

Dự án thuộc về **EduCycle Team**. Không sử dụng cho mục đích thương mại khi chưa có sự cho phép.

Made with ❤️ by **EduCycle Team**
