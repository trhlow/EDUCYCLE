🎓

# EduCycle Backend
**Trao Đổi Sách. Kết Nối Sinh Viên. Tái Sử Dụng Tri Thức.**  
*Nền tảng P2P giúp sinh viên mua bán sách giáo trình, tài liệu ôn thi & dụng cụ học tập — an toàn, minh bạch, bền vững.*

<p align="left">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-21-blue" alt="Java 21">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Security-JWT%20%2B%20OAuth2-orange" alt="Security">
</p>

[Quick Start](#-quick-start) · [Tính Năng](#-tính-năng) · [Kiến Trúc](#-kiến-trúc) · [Quy Trình](#-quy-trình-giao-dịch) · [Tech Stack](#-tech-stack) · [Đóng Góp](#-đóng-góp)

---

## 🔥 What's New
| Date | Version | Highlights |
|------|---------|------------|
| 18/03/2026 | `v1.0.0` | **Security Hardening** — Đưa cấu hình JWT Key vào biến môi trường, hash OTP bằng SHA-256, xóa email fallback nguy hiểm, restrict CORS policy. **CI/CD** — Setup Github Actions continuous-dev pipeline & release script tự động. |
| 17/03/2026 | `v0.11.0` | **Admin Dashboard** — Endpoint lấy stats tổng quan (doanh thu, users, products pending). |
| 16/03/2026 | `v0.10.0` | **User Reviews** — API cho phép đánh giá sau giao dịch. Fix N+1 queries với batch loading. |
| 15/03/2026 | `v0.9.0` | **Transactions & Messaging** — API tạo giao dịch, gửi/nhận OTP, duyệt trạng thái và Endpoint chat realtime. |
| 14/03/2026 | `v0.8.0` | **Products & Categories** — Product CRUD dành cho user/admin. |

---

## ⚡ Quick Start

### 1. Clone & install
```bash
git clone https://github.com/trhlow/EduCycle_Java_Backend_.git
cd EduCycle_Java_Backend_/educycle-java
```

### 2. Configure Database & ENV
Tạo CSDL PostgreSQL tên `educycledb`. Bạn phải set environment variable cho JWT secret:

```bash
export JWT_SECRET="YOUR_SUPER_SECRET_KEY_AT_LEAST_32_CHARS"
```

### 3. Run
```bash
mvn spring-boot:run
```
Truy cập Swagger UI → http://localhost:8080/swagger-ui.html

Yêu cầu: `Java ≥ 21` · `PostgreSQL ≥ 15` · `Maven 3.x`

---

## 🎯 Tính Năng

### 🔐 Xác Thực Đa Tầng (Auth)
| Tính năng | Mô tả |
|-----------|--------|
| Email & Mật Khẩu | BCrypt cost 11, đăng ký → sinh OTP → trả token JWT. |
| Social Login | Chấp nhận OAuth providers (Google, Facebook, Microsoft). Bắt buộc phải có email thật. |
| JWT Bearer | API bảo mật chặt chẽ. Stateless authentication không lưu session. Đã config issuer, audience. |
| Privacy Masking | API trả về tự động mã hoá tên User public: `NguyenVanA` → `Ngu***A`. |

### 🛍️ Giao Dịch P2P Thông Minh
| Tính năng | Mô tả |
|-----------|--------|
| State Machine | `PENDING` → `ACCEPTED` / `REJECTED` → `COMPLETED` / `CANCELLED`. |
| Validation | Block người dùng tự mua hàng của chính mình. Chỉ sản phẩm `APPROVED` mới được giao dịch. |
| Secure OTP | Generate OTP ngẫu nhiên 6 số chuẩn Cryptographic. OTP được băm `SHA-256` trước khi lưu vào database chống lộ lọt. Hai bên cùng xác nhận mới `COMPLETED`. |
| Auto-Delist | Trigger set Product về status `SOLD` khi verify OTP thành công. |

### 🛡️ Bảo Mật & An Toàn
| Tính năng | Mô tả |
|-----------|--------|
| Global Exception | Trả JSON format đồng nhất khi lỗi (`AppException` vs `Validation`). |
| CORS Restricted | Chặn origin tự do, chỉ whitelist domain dev (`localhost:5173`) và domain Production tương lai. |
| Secure Config | Tách hoàn toàn Secret Key khỏi YAML/Source code. Ràng buộc Validation lúc runtime. |

---

## 🏗️ Kiến Trúc

Dự án áp dụng mô hình **Layered Architecture** tinh gọn, kết hợp sức mạnh của Spring Data JPA.

```text
educycle-java/
├── pom.xml                         # Dependencies & Plugins
├── Dockerfile                      # Multi-stage build image
├── src/main/
│   ├── resources/
│   │   ├── application.yml         # Main config (DB, Flyway, Logging)
│   │   └── db/migration/           # Flyway SQL scripts (V1__initial.sql)
│   │
│   └── java/com/educycle/
│       ├── config/                 # AppConfig, JwtProperties, OpenApi, Security
│       ├── controller/             # REST Controllers (Auth, Product, Admin...)
│       ├── dto/                    # Request/Response data shapes
│       ├── enums/                  # Role, ProductStatus, TransactionStatus
│       ├── exception/              # GlobalExceptionHandler, AppException
│       ├── model/                  # JPA Entities (User, Product, Transaction...)
│       ├── repository/             # Spring Data JPA Interfaces
│       ├── security/               # JwtFilter, JwtProvider, UserDetails
│       ├── service/                # Business logic interfaces
│       ├── service/impl/           # Service Implementations
│       └── util/                   # OtpHasher, PrivacyHelper
```

---

## 🔄 Quy Trình Giao Dịch
EduCycle sử dụng quy trình giao dịch 5 bước đảm bảo minh bạch và an toàn cho cả người mua & người bán:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        EduCycle Transaction Flow                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   BUYER (Frontend)                  SELLER (Frontend)                   │
│   ─────                              ──────                             │
│                                                                         │
│   📩 Gửi yêu cầu mua ──────────────→ ⏳ Nhận thông báo                │
│                                       ├── ✅ Chấp nhận                  │
│                                       └── ❌ Từ chối → [END]            │
│                                                                         │
│   💬 Chat hẹn địa điểm ←───────────→ 💬 Chat thống nhất               │
│                                                                         │
│                                       🔑 Seller bấm "Tạo OTP"          │
│   🔐 Buyer nhận mã OTP ──────────────→ ✅ Seller xác nhận OTP          │
│                                                                         │
│   ⭐ Đánh giá Seller   ←───────────→ ⭐ Đánh giá Buyer                │
│                                                                         │
│   🎉 HOÀN THÀNH ─── (BE tự đổi Product Status) ─── 🎉                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Framework & Database
| Layer | Technology |
|-------|------------|
| API Framework | **Spring Boot 3.2.5** (Web, Security, Validation) |
| Runtime | **Java 21** |
| Database | **PostgreSQL 16** |
| ORM | **Hibernate / Spring Data JPA** |
| Migrations | **Flyway** |

### Security & Utils
| Layer | Technology |
|-------|------------|
| Token | **JJWT 0.12.5** |
| Hashing | **Spring BCrypt (Cost=11)** |
| Boilerplate | **Lombok** |
| API Docs | **Springfox / Swagger UI** |

---

## 📜 CI/CD & Deploy
Frontend và Backend đều tuân thủ Github Action chung tạo tính thống nhất. 

### Custom Continuous-Dev Pipeline
- Push code lên nhánh `dev` tự động **kích hoạt Auto Bump Semantic Version** theo Conventional Commits (trong script `continuous-dev.sh`).
- Server tự động Build Java & Run Tests.
- Chạy script `release.sh` để Merge sang `main`, gắn Git Tag vX.X.X.

### Các Script Support Cục Bộ:
- Khai báo tool MCP cho Agent qua: `GitNexus` Knowledge Graph 

---

## 🤝 Đóng Góp
Chúng tôi sử dụng quy trình **3-Branch Strategy**:
```text
main ←── production release (stable, auto deployed)
  │
  dev ←── development (commit hàng ngày trực tiếp vào đây)
    │
    v1.x.x ←── version snapshot phục vụ hotfix
```

### Quy trình đóng góp
1. Checkout branch `dev` và pull code mới nhất:
   ```bash
   git checkout dev && git pull origin dev
   ```
2. Commit theo Conventional Commits:
   ```bash
   git commit -m "feat(auth): thêm tính năng mới"
   git commit -m "fix(security): sửa lỗi lộ biến môi trường"
   ```
3. Pipeline Actions tự động xử lý phần còn lại.

---

## 📄 License
Dự án thuộc về EduCycle Team. Không sử dụng cho mục đích thương mại khi chưa có sự cho phép.

🎓 EduCycle — Trao đổi sách thông minh, kết nối sinh viên bền vững  
*Built with ❤️ by EduCycle Team · TraVinh, Viet Nam*
