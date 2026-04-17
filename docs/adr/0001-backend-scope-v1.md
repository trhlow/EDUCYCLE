# ADR 0001 — Phạm vi Backend V1 (đóng băng lõi)

| Trường | Giá trị |
|--------|---------|
| Trạng thái | Đã áp dụng (BE-1 — đóng băng & cắt phạm vi) |
| Ngày | 2026-04-16 |
| Bối cảnh stack | Spring Boot **4.0.5**, JPA/Hibernate, Flyway, Spring Security + JWT, WebSocket STOMP (SockJS), PostgreSQL |

## Bối cảnh

Backend hiện gom nhiều mảng trong cùng một module: marketplace (auth, sản phẩm, giao dịch, đánh giá), quản trị nhẹ, thông báo, wishlist, **AI chat + RAG** (embedding, bootstrap `AiKnowledgeBootstrap`), **book-wanted** + inquiry/messaging, **chat thời gian thực** (STOMP), tiện ích phụ (media Unsplash, upload file).

Mục tiêu giai đoạn **BE-1** là **chỉ cam kết hợp đồng API (contract) cho lõi marketplace V1**, để:

- tách **domain** rõ (auth/profile, listing, transaction, review, admin lite);
- **config** và **migration** có thể dọn theo từng vùng sau này mà không “kéo cả AI/book-wanted” vào định nghĩa V1;
- **test** tập trung flow lõi (auth → sản phẩm → giao dịch → review → admin tối thiểu).

ADR này định nghĩa **phạm vi V1** và **endpoint giữ / tạm ra ngoài lõi** để roadmap BE-2+ (tách module, feature flags, deprecate, tách deploy). Từ BE-3, runtime mặc định chỉ scan core V1; code ngoài lõi có thể vẫn tồn tại trong repo nhưng không thuộc contract mặc định.

## Quyết định

1. **V1 (lõi)** = auth + user/profile + product/listing + transaction (kèm tin nhắn giao dịch qua **HTTP**) + review + category + public health/profile + upload ảnh listing + **admin lite** (thống kê, user, tranh chấp).
2. **Tạm ra ngoài lõi V1** (không coi là phần bắt buộc của contract V1; có thể tắt hoặc tách sau): AI chat (kèm RAG/bootstrap), book-wanted (+ inquiry chat), wishlist, notifications “đầy đủ”, media Unsplash, **WebSocket/STOMP realtime** (coi là nâng cao so với HTTP messages), cường hóa Redis không bắt buộc.
3. **RAG bootstrap** là hành vi startup (`AiKnowledgeBootstrap` + `educycle.rag.*`), không phải REST endpoint riêng — vẫn xếp vào nhóm **ngoài lõi V1** cùng AI.

## Endpoint — **GIỮ** trong phạm vi V1

Base URL giả định: `/api` (trừ khi ghi chú khác).

### Auth (`AuthController`)

| Method | Path |
|--------|------|
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |
| POST | `/api/auth/verify-otp` |
| POST | `/api/auth/resend-otp` |
| POST | `/api/auth/verify-phone` |
| POST | `/api/auth/change-password` |
| POST | `/api/auth/forgot-password` |
| POST | `/api/auth/reset-password` |

### User / profile (`UsersController`)

| Method | Path |
|--------|------|
| GET | `/api/users/me` |
| PATCH | `/api/users/me` |
| PATCH | `/api/users/me/notification-preferences` |
| POST | `/api/users/me/accept-transaction-rules` |

### Public (`PublicHealthController`, `PublicProfileController`)

| Method | Path |
|--------|------|
| GET | `/api/public/health` |
| GET | `/api/public/users/{userId}` |

### Categories (`CategoriesController`)

| Method | Path |
|--------|------|
| POST | `/api/categories` |
| GET | `/api/categories` |
| GET | `/api/categories/{id}` |
| PUT | `/api/categories/{id}` |
| DELETE | `/api/categories/{id}` |

### Products / listing (`ProductsController`)

| Method | Path |
|--------|------|
| POST | `/api/products` |
| GET | `/api/products` |
| GET | `/api/products/mine` |
| GET | `/api/products/pending` |
| GET | `/api/products/admin/all` |
| GET | `/api/products/{id}` |
| PUT | `/api/products/{id}` |
| DELETE | `/api/products/{id}` |
| PATCH | `/api/products/{id}/approve` |
| PATCH | `/api/products/{id}/reject` |

### Transactions + tin nhắn theo giao dịch (`TransactionsController`)

| Method | Path |
|--------|------|
| POST | `/api/transactions` |
| GET | `/api/transactions/{id}` |
| GET | `/api/transactions` |
| GET | `/api/transactions/mine` |
| PATCH | `/api/transactions/{id}/status` |
| POST | `/api/transactions/{id}/cancel` |
| POST | `/api/transactions/{id}/otp` |
| POST | `/api/transactions/{id}/verify-otp` |
| POST | `/api/transactions/{id}/confirm` |
| POST | `/api/transactions/{id}/dispute` |
| GET | `/api/transactions/{transactionId}/messages` |
| POST | `/api/transactions/{transactionId}/messages` |

### Reviews (`ReviewsController`)

| Method | Path |
|--------|------|
| POST | `/api/reviews` |
| GET | `/api/reviews/{id}` |
| GET | `/api/reviews` |
| GET | `/api/reviews/product/{productId}` |
| GET | `/api/reviews/transaction/{transactionId}` |
| GET | `/api/reviews/user/{userId}` |
| DELETE | `/api/reviews/{id}` |

### Admin lite (`AdminController`)

| Method | Path |
|--------|------|
| GET | `/api/admin/stats` |
| GET | `/api/admin/users` |
| GET | `/api/admin/users/{id}` |
| POST | `/api/admin/users` |
| PATCH | `/api/admin/users/{id}` |
| GET | `/api/admin/transactions/disputed` |
| PATCH | `/api/admin/transactions/{id}/resolve` |

### Upload / file tĩnh phục vụ listing (`FileUploadController`)

| Method | Path |
|--------|------|
| POST | `/api/upload/product-image` |
| GET | `/api/files/{filename}` |

---

## Endpoint — **TẠM RA NGOÀI LÕI V1** (không thuộc contract lõi BE-1)

### AI chat + RAG (HTTP)

| Method | Path | Ghi chú |
|--------|------|---------|
| POST | `/api/ai/chat` | Kèm pipeline RAG trong service |
| POST | `/api/ai/chat/stream` | SSE |

RAG/bootstrap: cấu hình `educycle.rag.*`, `OPENAI_API_KEY`, runner `AiKnowledgeBootstrap` — **ngoài V1**.

### Book-wanted + inquiry

| Controller | Method | Path |
|------------|--------|------|
| `BookWantedController` | GET | `/api/book-wanted` |
| | GET | `/api/book-wanted/mine` |
| | GET | `/api/book-wanted/{id}` |
| | POST | `/api/book-wanted` |
| | PATCH | `/api/book-wanted/{id}` |
| | DELETE | `/api/book-wanted/{id}` |
| `BookWantedInquiryController` | POST | `/api/book-wanted/{postId}/inquiries` |
| | GET | `/api/book-wanted/{postId}/inquiries` |
| | GET | `/api/book-wanted/inquiries/{inquiryId}` |
| | GET | `/api/book-wanted/inquiries/{inquiryId}/messages` |
| | POST | `/api/book-wanted/inquiries/{inquiryId}/messages` |

### Wishlist

| Method | Path |
|--------|------|
| GET | `/api/wishlist` |
| POST | `/api/wishlist/{productId}` |
| DELETE | `/api/wishlist/{productId}` |

### Notifications (API đầy đủ — không nằm trong danh sách lõi BE-1)

| Method | Path |
|--------|------|
| GET | `/api/notifications` |
| GET | `/api/notifications/unread-count` |
| PATCH | `/api/notifications/{id}/read` |
| PATCH | `/api/notifications/read-all` |

### Media Unsplash (tiện ích)

| Method | Path |
|--------|------|
| GET | `/api/media/unsplash/curated` |

---

## WebSocket / STOMP — **tạm ra ngoài lõi V1**

Không phải REST; vẫn liệt kê để tránh nhầm với “chat lõi”.

| Thành phần | Chi tiết |
|------------|----------|
| SockJS + STOMP endpoint | `GET` (handshake) `/ws` |
| Gửi tin (client → server) | destination `/app/chat.send` (`ChatController`) |
| Broker | `/topic`, `/queue`, prefix `/user` (`WebSocketConfig`) |

**V1 contract cho chat theo giao dịch:** ưu tiên **HTTP** `GET/POST /api/transactions/{transactionId}/messages`. STOMP là **nâng cao / phase sau** hoặc optional.

---

## Hệ quả

- **Tài liệu & CI:** có thể gắn nhãn test “V1-core” chỉ chạm các nhóm endpoint ở bảng **GIỮ**.
- **Frontend / client khác:** chỉ cần đảm bảo flow marketplace nếu self-declare “chỉ V1”.
- **BE-3:** migration được reset thành `V1__baseline.sql`; cần reset DB local/dev đã chạy chuỗi migration cũ trước khi apply baseline mới.
- **BE tiếp theo:** tách package/module hoặc feature flags theo domain nếu muốn đưa AI/book-wanted/wishlist/media quay lại.

## Liên kết

- Stack & port: `docs/README.md`, `docs/architecture/README.md`
- AI / Redis: `docs/guides/ai-chatbot.md`
