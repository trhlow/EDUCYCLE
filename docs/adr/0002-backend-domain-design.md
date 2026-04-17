# ADR 0002 — Thiết kế domain-first (BE-2)

| Trường | Giá trị |
|--------|---------|
| Trạng thái | Đã áp dụng trên code (`backend/educycle-java`, package `com.educycle.*` domain-first) |
| Ngày | 2026-04-16 |
| Phụ thuộc | [ADR 0001 — Phạm vi Backend V1](./0001-backend-scope-v1.md) |

## Mục tiêu

Bỏ tư duy **package phẳng** (`controller`, `service`, `model`, `repository` cùng cấp), chuyển sang **domain-first**: mỗi bounded context gom **API (adapter)**, **application service**, **domain** (entity, enum, rule), **persistence (port/adapter)** trong một cây có ranh giới rõ.

**Không làm ở giai đoạn này** (ghi rõ để tránh scope creep):

- Tối ưu hiệu năng sớm (batch query, index tuning ngoài nhu cầu bugfix).
- Cache (Redis / local) sớm.
- WebSocket / STOMP — thiết kế REST transaction messages đủ cho V1; realtime để phase sau.

---

## Cấu trúc package mục tiêu

Filesystem mục tiêu (monorepo backend hoặc module `api`):

```text
apps/api/src/main/java/com/educycle
├── EduCycleApplication.java          # bootstrap (có thể ở shared hoặc root)
├── shared
│   ├── config
│   ├── security
│   ├── exception
│   ├── response
│   └── util
├── auth
├── user
├── listing
├── transaction
├── review
└── admin
```

**Ghi chú triển khai repo hiện tại:** code đang nằm trong `backend/educycle-java/`. Việc đổi sang đúng đường dẫn `apps/api/...` là **tách module / dời thư mục** (BE-3+). BE-2 chỉ **chốt cây logic**; khi chưa tách module, giữ nguyên `src/main/java/com/educycle` nhưng **bên trong** bắt chước cây trên (package `com.educycle.listing`, v.v.).

### Quy ước con trong mỗi domain (gợi ý chuẩn hóa BE-3)

```text
<domain>/
├── api/                    # @RestController — chỉ map HTTP, delegate service
├── application/            # @Service, use-case, transaction boundary
├── domain/                 # entity, enum, domain services thuần (không phụ thuộc Spring Web)
└── persistence/            # JpaRepository, entity mapping nếu tách khỏi domain
```

`shared` giữ cross-cutting: `GlobalExceptionHandler`, JWT filter, CORS, rate limit, `MessageConstants`, health công khai (hoặc `shared.api` tối thiểu).

---

## Aggregate & ranh giới bounded context

| Bounded context | Aggregate gốc (root) | Thành phần trong boundary | Ghi chú ranh giới |
|-----------------|----------------------|---------------------------|-------------------|
| **auth** | *session / credentials* (không nhất thiết là một JPA aggregate) | OTP, refresh token, JWT issuance, đăng ký/đăng nhập | **Không** chứa profile hiển thị hay sản phẩm. Chỉ tham chiếu `userId` sau khi xác thực. |
| **user** | **User** (profile, role, preferences, flags nghiệp vụ user) | `User`, public profile projection, `accept-transaction-rules`, notification *preferences* (nếu vẫn là field user) | Listing/Transaction **chỉ đọc** snapshot cần thiết (id, role) qua port hoặc join read-only — không sửa Product từ user service. |
| **listing** | **Product** | `Product`, **Category** (taxonomy phục vụ listing), ảnh upload URL gắn listing | Category là **catalog** chung: thay đổi ảnh hưởng tới filter listing; coi là cùng context “chợ” với Product. Trạng thái duyệt listing thuộc **Product** + quyền **admin**. |
| **transaction** | **Transaction** | `Transaction`, **Message** (1-n theo transaction), OTP, dispute fields | Message **không** là aggregate riêng cho V1: luôn nhất quán qua `Transaction` (tạo message = use case trên transaction). |
| **review** | **Review** | `Review` | Tham chiếu `productId`, `targetUserId`, `transactionId` là **ID ngoài** — không cascade sửa Product/User. Quy tắc “khi nào được review” do **transaction** phối hợp (application orchestration) hoặc domain event sau này; BE-2 chỉ chốt **Review là root** của nhận xét. |
| **admin** | *không có aggregate “Admin”* | Use case tập trung: stats, CRUD user nhẹ, giải quyết tranh chấp | Là **application layer** cross-domain: được phép gọi port vào `user`, `transaction`, `listing` theo role `ADMIN`. Không nhét logic nghiệp vụ buyer/seller vào đây. |

**Ngoài V1 (ADR 0001):** AI, book-wanted, wishlist, notification feed — không định nghĩa lại aggregate trong BE-2; khi re-introduce, tách package riêng (`wishlist`, `notification`, …) để không làm `listing` phình ra.

---

## Enum trạng thái & giá trị API

**Quy tắc serialization:** JSON dùng **chuỗi UPPERCASE** khớp tên enum Java (đã thống nhất với frontend — `EnumType.STRING`).

### V1 lõi

| Enum | Vị trí đề xuất (package) | Giá trị | Ý nghĩa ngắn |
|------|--------------------------|---------|--------------|
| `TransactionStatus` | `transaction.domain` | `PENDING`, `ACCEPTED`, `MEETING`, `COMPLETED`, `AUTO_COMPLETED`, `REJECTED`, `CANCELLED`, `DISPUTED` | Vòng đời giao dịch; `AUTO_COMPLETED` là terminal giống hoàn tất có điều kiện scheduler. |
| `ProductStatus` | `listing.domain` | `PENDING`, `APPROVED`, `REJECTED`, `SOLD` | Moderation + đã bán. |
| `Role` | `user.domain` (hoặc `shared.security` nếu chỉ dùng cho JWT) | `USER`, `ADMIN` | RBAC. |

### Ngoài contract V1 lõi (vẫn tồn tại trong codebase cho tới khi tách)

| Enum | Giá trị |
|------|---------|
| `BookWantedStatus` | `OPEN`, `CLOSED` |

**Không thêm** enum trạng thái mới cho `Review` (chỉ có bản ghi tồn tại / xóa mềm nếu sau này có) trong BE-2.

---

## Ownership & quyền thay đổi (rules)

Ma trận tối thiểu — áp tại **application service** (và security URL nếu cần).

| Tài nguyên | Hành động | Ai được phép |
|------------|-----------|----------------|
| **Product** | CRUD bản nháp / chờ duyệt | **Seller** (`seller_id` = current user). |
| **Product** | `approve` / `reject` | **ADMIN** (hoặc policy tương đương). |
| **Product** | Đánh dấu `SOLD` | Luồng nghiệp vụ (thường qua **transaction** hoàn tất), không chỉnh tay ngẫu nhiên từ API public. |
| **Category** | CRUD | **ADMIN** (theo hiện trạng API categories). |
| **Transaction** | Tạo | **Buyer** (đối với sản phẩm `APPROVED`, không phải chính seller). |
| **Transaction** | Đổi trạng thái / OTP / confirm / cancel | **Buyer hoặc Seller** của đúng giao dịch (theo từng use case). |
| **Transaction** | `dispute` | **Buyer hoặc Seller** liên quan. |
| **Transaction** | `resolve` tranh chấp | **ADMIN**. |
| **Message** | Gửi / đọc theo `transactionId` | **Buyer hoặc Seller** của giao dịch đó. |
| **Review** | Tạo | User đủ điều kiện nghiệp vụ (ví dụ đã hoàn thành giao dịch liên quan) — enforce trong `review.application`. |
| **Review** | Xóa | **Tác giả** hoặc **ADMIN** (theo policy hiện có / mở rộng). |
| **User profile** | `PATCH /me` | **Chính user**. |
| **Admin user ops** | CRUD/patch user | **ADMIN**. |

**Forbidden vs Unauthorized:** không có token / token sai → **401**; đúng user nhưng không phải chủ resource → **403** (`ForbiddenException`).

---

## Response envelope

### Hiện trạng

- **Thành công (2xx):** body trực tiếp là DTO/record (không bọc `data`).
- **Lỗi:** `GlobalExceptionHandler` trả `{ "success": false, "message": "...", "errors": [...] }` (record nội bộ `ErrorResponse`).

### Chốt cho BE-2 (thiết kế, không bắt buộc đổi hết API một lần)

| Loại | Hình dạng | Ghi chú |
|------|-----------|---------|
| **Lỗi** | Giữ `{ success: false, message, errors }` | Đưa record/type ra `shared.response` (ví dụ `ErrorBody`) để tái sử dụng và test. |
| **Thành công** | **V1 tương thích:** tiếp tục trả DTO trần cho các endpoint hiện có. | Tránh break FE. |
| **Thành công (API mới hoặc major version sau)** | Cho phép `{ success: true, data: T, meta?: ... }` trong `shared.response`. | Dùng cho pagination admin / list lớn khi có version mới; không áp hồi tố cả monolith trong BE-2. |

**Không** ép envelope success cho toàn bộ ứng dụng trong giai đoạn thiết kế domain.

---

## Exception model

### Hiện trạng (giữ nguyên triết lý)

- `AppException` (abstract) + `HttpStatus`.
- Cụ thể: `BadRequestException` (400), `NotFoundException` (404), `UnauthorizedException` (401), `ForbiddenException` (403).
- `GlobalExceptionHandler`: validation, JSON sai, `DataIntegrityViolationException`, generic 500.

### Chốt BE-2

| Nguyên tắc | Chi tiết |
|------------|----------|
| **Chỉ ném** các exception ứng dụng kế thừa `AppException` cho lỗi nghiệp vụ có HTTP code cố định. | Không `throw new RuntimeException("...")` trong service domain. |
| **Mã lỗi máy đọc (optional, phase sau):** | Có thể bổ sung field `code` (string ổn định) trong error body — **không** bắt buộc trong BE-2; ưu tiên `message` + HTTP status. |
| **Vị trí package** | Toàn bộ class exception → `com.educycle.shared.exception` (handler + base + concrete). |

---

## Mapping từ cấu trúc cũ (hướng dẫn di chuyển BE-3+)

| Cũ (gói phẳng) | Mới (domain) |
|----------------|--------------|
| `controller/AuthController` | `auth.api` |
| `service/AuthService*` | `auth.application` |
| `controller/UsersController`, `PublicProfileController` | `user.api` |
| `controller/ProductsController`, `CategoriesController` | `listing.api` |
| `controller/TransactionsController` | `transaction.api` |
| `controller/ReviewsController` | `review.api` |
| `controller/AdminController` | `admin.api` |
| `config/*`, `security/*`, `exception/*` | `shared.config`, `shared.security`, `shared.exception` |
| `model/*`, `repository/*` | Tách theo domain vào `*.domain` / `*.persistence` |

---

## Tóm tắt

- **Domain-first:** `shared` + sáu nhánh `auth`, `user`, `listing`, `transaction`, `review`, `admin`.
- **Transaction** là aggregate cho **Message**; **Review** độc lập với tham chiếu ngoài.
- **Enum** V1: `TransactionStatus`, `ProductStatus`, `Role` — JSON UPPERCASE.
- **Ownership:** seller/admin cho listing; buyer/seller cho transaction & message; admin cho tranh chấp & category; author cho review delete.
- **Envelope:** lỗi đã có shape ổn định; success envelope chỉ cho API/version mới, không retrofit toàn bộ trong BE-2.
- **Loại trừ có chủ đích:** không thiết kế sâu perf, cache, WebSocket trong ADR này.
