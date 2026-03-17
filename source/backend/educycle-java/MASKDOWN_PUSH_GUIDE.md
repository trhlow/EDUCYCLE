# EduCycle – Java Backend – 3‑Branch + Semantic Versioning
# Maskdown Automation Template (Dùng cho AI tự động push hàng ngày)

> **⚠️ IMPORTANT**: Không sử dụng feature branches. Commit trực tiếp vào `dev` mỗi ngày.
> AI đọc file này → xác định ngày hiện tại → thay placeholder → thực thi script.

---

## 🔧 1. CONFIG

```bash
CODEBASE="D:/educycle-java-final"
GH_REPO="https://github.com/trhlow/EduCycle_Java_Backend_.git"
DEV_BRANCH="dev"
MAIN_BRANCH="main"
SRC_ROOT="$CODEBASE/educycle-java/src/main/java/com/educycle"
RES_ROOT="$CODEBASE/educycle-java/src/main/resources"
```

---

## 🌿 2. BRANCHING STRATEGY

| Branch | Role | Rule |
|--------|------|------|
| `main` | Production‑ready | Chỉ merge từ `dev`. Không commit trực tiếp |
| `dev` | Development | Commit hàng ngày vào đây |
| `v*.*.*` | Version branch | Tạo từ `main` sau khi tag. Dùng cho hot‑fix |

> **Key rule**: Không có nhánh `feature/*`. Cứ commit vào `dev`.

---

## 🔢 3. SEMANTIC VERSIONING

| Type | Khi nào tăng | Ví dụ |
|------|-------------|-------|
| **MAJOR** | Thay đổi không tương thích ngược (breaking change) | `v1.0.0` → `v2.0.0` |
| **MINOR** | Thêm tính năng mới, vẫn tương thích ngược | `v1.0.0` → `v1.1.0` |
| **PATCH** | Sửa lỗi, không thay đổi tính năng | `v1.0.0` → `v1.0.1` |

- `v0.x.x` → pre‑release (đang phát triển, chưa sản phẩm đầy đủ)
- `v1.0.0` → đánh dấu phát hành chính thức (xong toàn bộ, merge `dev` → `main`)

---

## 📅 4. LỊCH PHÁT TRIỂN (Schedule)

> AI: Tra cứu ngày hiện tại → tìm dòng tương ứng → lấy `${VERSION}`, `${COMMIT_MSG}`, `${DAY_FILES}`.

| Ngày | `${VERSION}` | `${COMMIT_MSG}` | `${DAY_FILES}` (đường dẫn tương đối từ `$SRC_ROOT`) | Status |
|------|-------------|-----------------|------------------------------------------------------|--------|
| **17/03** | – | `chore: init project with .gitignore and README.md` | `.gitignore`, `educycle-java/README.md` | ✅ DONE |
| **18/03** | `v0.1.0` | `feat: project skeleton (v0.1.0)` | Xem **[DAY-18]** | ⬜ |
| **19/03** | `v0.2.0` | `feat: database schema - Flyway migration (v0.2.0)` | Xem **[DAY-19]** | ⬜ |
| **20/03** | `v0.3.0` | `feat: entity models and enums (v0.3.0)` | Xem **[DAY-20]** | ⬜ |
| **21/03** | `v0.4.0` | `feat: security config and JWT authentication (v0.4.0)` | Xem **[DAY-21]** | ⬜ |
| **22/03** | `v0.5.0` | `feat: global exception handling (v0.5.0)` | Xem **[DAY-22]** | ⬜ |
| **23/03** | `v0.6.0` | `feat: authentication - register, login, OTP, social login (v0.6.0)` | Xem **[DAY-23]** | ⬜ |
| **24/03** | `v0.7.0` | `feat: category CRUD management (v0.7.0)` | Xem **[DAY-24]** | ⬜ |
| **25/03** | `v0.8.0` | `feat: product management with admin approval (v0.8.0)` | Xem **[DAY-25]** | ⬜ |
| **26/03** | `v0.9.0` | `feat: transactions and messaging system (v0.9.0)` | Xem **[DAY-26]** | ⬜ |
| **27/03** | `v0.10.0` | `feat: review and rating system (v0.10.0)` | Xem **[DAY-27]** | ⬜ |
| **28/03** | `v0.11.0` → `v1.0.0` | `feat: admin dashboard (v0.11.0)` + RELEASE | Xem **[DAY-28]** | ⬜ |

---

## 📂 5. CHI TIẾT FILES TỪNG NGÀY

### [DAY-18] – v0.1.0 – Project Skeleton
```
educycle-java/pom.xml
educycle-java/src/main/resources/application.yml
educycle-java/src/main/java/com/educycle/EduCycleApplication.java
```
**Tổng: 3 files**

---

### [DAY-19] – v0.2.0 – Database Schema
```
educycle-java/src/main/resources/db/migration/V1__initial_schema.sql
```
**Tổng: 1 file**

---

### [DAY-20] – v0.3.0 – Entity Models + Enums
```
# Models
educycle-java/src/main/java/com/educycle/model/User.java
educycle-java/src/main/java/com/educycle/model/Product.java
educycle-java/src/main/java/com/educycle/model/Category.java
educycle-java/src/main/java/com/educycle/model/Transaction.java
educycle-java/src/main/java/com/educycle/model/Review.java
educycle-java/src/main/java/com/educycle/model/Message.java

# Enums
educycle-java/src/main/java/com/educycle/enums/Role.java
educycle-java/src/main/java/com/educycle/enums/ProductStatus.java
educycle-java/src/main/java/com/educycle/enums/TransactionStatus.java
```
**Tổng: 9 files**

---

### [DAY-21] – v0.4.0 – Security & JWT
```
# Config
educycle-java/src/main/java/com/educycle/config/SecurityConfig.java
educycle-java/src/main/java/com/educycle/config/JwtProperties.java
educycle-java/src/main/java/com/educycle/config/AppConfig.java
educycle-java/src/main/java/com/educycle/config/OpenApiConfig.java

# Security
educycle-java/src/main/java/com/educycle/security/JwtAuthenticationFilter.java
educycle-java/src/main/java/com/educycle/security/JwtTokenProvider.java
educycle-java/src/main/java/com/educycle/security/UserDetailsServiceImpl.java
```
**Tổng: 7 files**

---

### [DAY-22] – v0.5.0 – Exception Handling
```
educycle-java/src/main/java/com/educycle/exception/AppException.java
educycle-java/src/main/java/com/educycle/exception/BadRequestException.java
educycle-java/src/main/java/com/educycle/exception/NotFoundException.java
educycle-java/src/main/java/com/educycle/exception/UnauthorizedException.java
educycle-java/src/main/java/com/educycle/exception/GlobalExceptionHandler.java
```
**Tổng: 5 files**

---

### [DAY-23] – v0.6.0 – Authentication
```
# Controller
educycle-java/src/main/java/com/educycle/controller/AuthController.java

# Service
educycle-java/src/main/java/com/educycle/service/AuthService.java
educycle-java/src/main/java/com/educycle/service/impl/AuthServiceImpl.java

# Repository
educycle-java/src/main/java/com/educycle/repository/UserRepository.java

# DTOs
educycle-java/src/main/java/com/educycle/dto/auth/RegisterRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/LoginRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/SocialLoginRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/VerifyOtpRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/ResendOtpRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/VerifyPhoneRequest.java
educycle-java/src/main/java/com/educycle/dto/auth/AuthResponse.java
```
**Tổng: 11 files**

---

### [DAY-24] – v0.7.0 – Categories CRUD
```
# Controller
educycle-java/src/main/java/com/educycle/controller/CategoriesController.java

# Service
educycle-java/src/main/java/com/educycle/service/CategoryService.java
educycle-java/src/main/java/com/educycle/service/impl/CategoryServiceImpl.java

# Repository
educycle-java/src/main/java/com/educycle/repository/CategoryRepository.java

# DTOs
educycle-java/src/main/java/com/educycle/dto/category/CreateCategoryRequest.java
educycle-java/src/main/java/com/educycle/dto/category/CategoryResponse.java
```
**Tổng: 6 files**

---

### [DAY-25] – v0.8.0 – Products
```
# Controller
educycle-java/src/main/java/com/educycle/controller/ProductsController.java

# Service
educycle-java/src/main/java/com/educycle/service/ProductService.java
educycle-java/src/main/java/com/educycle/service/impl/ProductServiceImpl.java

# Repository
educycle-java/src/main/java/com/educycle/repository/ProductRepository.java

# DTOs
educycle-java/src/main/java/com/educycle/dto/product/CreateProductRequest.java
educycle-java/src/main/java/com/educycle/dto/product/UpdateProductRequest.java
educycle-java/src/main/java/com/educycle/dto/product/ProductResponse.java
```
**Tổng: 7 files**

---

### [DAY-26] – v0.9.0 – Transactions + Messaging
```
# Controller
educycle-java/src/main/java/com/educycle/controller/TransactionsController.java

# Transaction Service
educycle-java/src/main/java/com/educycle/service/TransactionService.java
educycle-java/src/main/java/com/educycle/service/impl/TransactionServiceImpl.java
educycle-java/src/main/java/com/educycle/repository/TransactionRepository.java

# Message Service
educycle-java/src/main/java/com/educycle/service/MessageService.java
educycle-java/src/main/java/com/educycle/service/impl/MessageServiceImpl.java
educycle-java/src/main/java/com/educycle/repository/MessageRepository.java

# Transaction DTOs
educycle-java/src/main/java/com/educycle/dto/transaction/CreateTransactionRequest.java
educycle-java/src/main/java/com/educycle/dto/transaction/TransactionResponse.java
educycle-java/src/main/java/com/educycle/dto/transaction/TransactionVerifyOtpRequest.java
educycle-java/src/main/java/com/educycle/dto/transaction/UpdateTransactionStatusRequest.java

# Message DTOs
educycle-java/src/main/java/com/educycle/dto/message/SendMessageRequest.java
educycle-java/src/main/java/com/educycle/dto/message/MessageResponse.java
```
**Tổng: 13 files**

---

### [DAY-27] – v0.10.0 – Reviews
```
# Controller
educycle-java/src/main/java/com/educycle/controller/ReviewsController.java

# Service
educycle-java/src/main/java/com/educycle/service/ReviewService.java
educycle-java/src/main/java/com/educycle/service/impl/ReviewServiceImpl.java

# Repository
educycle-java/src/main/java/com/educycle/repository/ReviewRepository.java

# DTOs
educycle-java/src/main/java/com/educycle/dto/review/CreateReviewRequest.java
educycle-java/src/main/java/com/educycle/dto/review/ReviewResponse.java
```
**Tổng: 6 files**

---

### [DAY-28] – v0.11.0 + RELEASE v1.0.0 – Admin Dashboard
```
# Controller
educycle-java/src/main/java/com/educycle/controller/AdminController.java

# DTO
educycle-java/src/main/java/com/educycle/dto/admin/DashboardStatsResponse.java
```
**Tổng: 2 files** → sau đó chạy **Release Script** (xem Section 7)

---

## 🏗️ 6. DAILY PROCESS – Script tự động

> **AI Instruction**: Mỗi ngày, đọc lịch ở Section 4, lấy `${VERSION}` + `${COMMIT_MSG}`,
> tra Section 5 lấy danh sách files `${DAY_FILES}`, rồi chạy script dưới đây.

```bash
#!/usr/bin/env bash
set -euo pipefail

# ─── CONFIG (cố định) ────────────────────────────────────────
CODEBASE="D:/educycle-java-final"
DEV_BRANCH="dev"

# ─── PLACEHOLDER (AI thay mỗi ngày) ─────────────────────────
COMMIT_VERSION="${VERSION}"              # e.g. v0.1.0
COMMIT_MSG="${COMMIT_MSG}"               # e.g. feat: project skeleton (v0.1.0)

# ─── 1. Checkout dev & pull ──────────────────────────────────
cd "$CODEBASE"
git checkout "$DEV_BRANCH"
git pull origin "$DEV_BRANCH"

# ─── 2. Stage files cho ngày hôm nay ─────────────────────────
# AI: dùng `git add` cho TỪNG file trong ${DAY_FILES}
# Ví dụ cho ngày 18/03:
#   git add educycle-java/pom.xml
#   git add educycle-java/src/main/resources/application.yml
#   git add educycle-java/src/main/java/com/educycle/EduCycleApplication.java

${DAY_FILES_GIT_ADD}

# ─── 3. Commit ───────────────────────────────────────────────
git commit -m "$COMMIT_MSG"

# ─── 4. Push lên dev ─────────────────────────────────────────
git push origin "$DEV_BRANCH"

# ─── 5. Verify ───────────────────────────────────────────────
echo "✅ Push thành công: $COMMIT_VERSION"
git log -1 --oneline
```

### Bảng Placeholder

| Placeholder | Mô tả | Nguồn |
|-------------|--------|-------|
| `${VERSION}` | Semantic version của ngày | Cột `${VERSION}` trong Section 4 |
| `${COMMIT_MSG}` | Commit message đầy đủ | Cột `${COMMIT_MSG}` trong Section 4 |
| `${DAY_FILES}` | Danh sách file cần add | Tra theo `[DAY-XX]` trong Section 5 |
| `${DAY_FILES_GIT_ADD}` | Các lệnh `git add <file>` | Tạo từ `${DAY_FILES}` |

---

## 📦 7. RELEASE SCRIPT – Merge dev → main + Tag (Ngày 28/03)

> **Chỉ chạy SAU KHI commit `v0.11.0` (Admin Dashboard) đã push lên `dev`.**

```bash
#!/usr/bin/env bash
set -euo pipefail

CODEBASE="D:/educycle-java-final"
MAIN_BRANCH="main"
DEV_BRANCH="dev"
TAG="v1.0.0"

# ─── 1. Merge dev → main ─────────────────────────────────────
cd "$CODEBASE"
git checkout "$MAIN_BRANCH"
git pull origin "$MAIN_BRANCH"
git merge --no-ff "$DEV_BRANCH" -m "Merge dev → main for ${TAG}"
git push origin "$MAIN_BRANCH"

# ─── 2. Tạo Tag Release ──────────────────────────────────────
git tag -a "$TAG" -m "Release ${TAG} – Full EduCycle Java Backend"
git push origin "$TAG"

# ─── 3. (Optional) Tạo branch version cho hot‑fix ────────────
git checkout -b "$TAG"
git push origin "$TAG"

echo "🎉 Release $TAG hoàn tất!"
```

---

## ✅ 8. VERIFICATION CHECKLIST

> AI: Chạy sau mỗi lần push để xác minh.

| Stage | Lệnh / Kiểm tra | Expected Result |
|-------|-----------------|-----------------|
| **Dev push** | `git log -1 --oneline` | Message chứa `(${VERSION})` |
| **GitHub dev** | Kiểm tra branch `dev` trên GitHub | Chỉ có files tương ứng với commit ngày đó |
| **GitHub main** | Kiểm tra branch `main` trên GitHub | Không thay đổi (chỉ có `.gitignore` + `README.md` cho đến ngày 28) |
| **Merge (28/03)** | `git log main --oneline -1` | `Merge dev → main for v1.0.0` |
| **Release** | `git tag` | `v1.0.0` xuất hiện |
| **Build** | `cd educycle-java && mvn clean compile` | BUILD SUCCESS (chạy trên `dev` trước release) |
| **Package** | `cd educycle-java && mvn clean package` | BUILD SUCCESS (chạy khi merge vào `main`) |

---

## 🤖 9. AI WORKFLOW – Hướng dẫn cho AI tự động

```
┌──────────────────────────────────────────────────┐
│  AI nhận lệnh "làm task ngày hôm nay"            │
│                                                    │
│  1. Đọc file MASKDOWN_PUSH_GUIDE.md               │
│  2. Xác định ngày hiện tại (DD/MM)                │
│  3. Tra Section 4 → lấy VERSION, COMMIT_MSG       │
│  4. Tra Section 5 → lấy DAY_FILES                 │
│  5. Thay placeholder trong Section 6 script        │
│  6. Thực thi script                                │
│  7. Chạy Verification (Section 8)                  │
│  8. Cập nhật Status trong Section 4: ⬜ → ✅       │
│                                                    │
│  Nếu ngày 28/03:                                   │
│    → Chạy thêm Section 7 (Release Script)          │
│    → Verify tag + merge trên GitHub                │
│                                                    │
│  Nếu hot‑fix sau release:                          │
│    → Checkout branch v1.0.0                        │
│    → Sửa → commit → push → tag v1.0.1             │
└──────────────────────────────────────────────────┘
```

### AI Decision Logic:

```
IF ngày hiện tại MATCH một dòng trong Section 4:
    IF Status == ⬜:
        → Thực thi Daily Process (Section 6)
        → Chạy Verification (Section 8)
        → Đánh dấu Status = ✅
    ELIF Status == ✅:
        → Báo "Ngày này đã hoàn thành"
    END

IF ngày == 28/03 AND v0.11.0 đã push:
    → Chạy Release Script (Section 7)
    → Chạy Verification cho Release
END
```

---

## 🔥 10. HOT‑FIX (Sau Release)

Nếu phát hiện bug sau khi đã release `v1.0.0`:

```bash
# Checkout branch version
git checkout v1.0.0

# Sửa bug
# ... edit files ...

# Commit + push
git commit -am "fix: mô tả bug (v1.0.1)"
git push origin v1.0.0

# Tạo tag patch
git tag -a v1.0.1 -m "Hotfix v1.0.1 – mô tả fix"
git push origin v1.0.1

# Merge fix vào dev (để dev cũng có fix)
git checkout dev
git merge v1.0.0
git push origin dev
```
