# EduCycle — Báo Cáo Tái Thiết Kế Toàn Diện

> Historical design note from March 2026. Keep this as context for past tradeoffs, not as the primary source of truth for the current repo structure.

**Principal Engineer · 2026-03-26**  
**Câu hỏi chính:** Chuyển sang MongoDB? Quy trình giao dịch có quá rắc rối không? Cần thay đổi gì?

---

## Câu Trả Lời Thẳng (Executive Answer)

| Câu hỏi | Trả lời |
|---------|---------|
| Có nên chuyển sang MongoDB không? | **KHÔNG.** Dữ liệu quan hệ chặt, ACID bắt buộc, 0 lợi ích kỹ thuật. |
| Luồng giao dịch có rề rà không? | **CÓ.** 7 bước → 3 bước thực sự. Trạng thái MEETING là thừa. |
| Ai cũng có thể huỷ được không? | **Phải làm được.** Cả 2 bên đều có quyền huỷ với lý do, không cần admin. |
| Cần thay đổi những gì? | Xem 3 sprint dưới — ưu tiên UX trước, infra sau. |

---

## Phần 1: MongoDB Migration Analysis — Không Nên Làm

### Lý do kỹ thuật cụ thể

Data model của EduCycle **vốn là quan hệ**:

```
User (1) ─── (N) Product     (FK: user_id)
User (1) ─── (N) Transaction (FK: buyer_id, seller_id)
Product (1) ── (1) Transaction (FK: product_id)
Transaction (1) ─ (N) Message  (FK: transaction_id)
Transaction (1) ─ (N) Review   (FK: transaction_id)
User (1) ─── (N) WishlistItem (FK: user_id, product_id)
```

`Transaction` có **3 FK đến 2 bảng khác nhau** (buyer_id, seller_id → users; product_id → products). Trong MongoDB, mỗi query chi tiết giao dịch cần `$lookup` nhiều lần so với PostgreSQL + JPA.

### Vấn đề ACID với OTP

OTP completion + cập nhật sản phẩm cần **cùng transaction** — PostgreSQL + `@Transactional` phù hợp; MongoDB multi-document cần transaction session, phức tạp hơn.

### Chi phí migration

| Hạng mục | Ước tính |
|----------|----------|
| Rewrite entity/repository, Flyway, test | Nhiều ngày |
| **Lợi ích thu được** | **Không có lợi ích kỹ thuật rõ ràng cho core domain** |

### Khi nào nên dùng MongoDB (nếu muốn hybrid)

- Activity logs, archive chat, hoặc search index — **không** thay core transactional store.

**Verdict: Giữ PostgreSQL.** Nâng cấp bằng `tsvector`, `pgvector` (nếu cần) là đủ.

---

## Phần 2: Phân Tích Luồng Giao Dịch Hiện Tại

### Bản đồ trạng thái và vấn đề

| Bước | Trạng thái | Ghi chú |
|------|------------|---------|
| 1 | Buyer tạo giao dịch | Cần thiết |
| 2 | Seller ACCEPT/REJECT | Cần thiết |
| 3 | Chat hẹn | Cần thiết, không cần state riêng |
| 4 | MEETING | Thừa nếu chỉ để mở OTP |
| 5 | OTP (buyer tạo, seller nhập) | Cần thiết |
| COMPLETED | — | Cần thiết |

### Vấn đề nghiêm trọng: Thoát giao dịch sau ACCEPTED

- `openDispute` yêu cầu `MEETING` — tranh chấp không mở được nếu chưa đúng bước.
- UX mong muốn: **cả hai bên** có thể **hủy có lý do** trước khi hoàn tất (không bắt buộc admin cho hủy thường).

### Modal nội quy

Friction khi phụ thuộc `localStorage` — có thể đưa preference lên server sau (Sprint B trong backlog).

---

## Phần 3: Thiết Kế Lại Luồng Giao Dịch (Đề xuất)

### Nguyên tắc

1. Hai bên có thể hủy (trừ terminal) với lý do (tuỳ chọn).
2. Admin cho tranh chấp nghiêm trọng, không phải mọi “thoát”.
3. Có thể bỏ MEETING: OTP khi `ACCEPTED` (sau khi thống nhất state machine + migration).
4. Auto-expire (ví dụ 48h) — job định kỳ.
5. TTL OTP tăng (ví dụ 30 phút) nếu cần.

### State machine đề xuất (tóm tắt)

```
PENDING → ACCEPTED → COMPLETED (OTP)
       → REJECTED / CANCELLED
ACCEPTED → CANCELLED (buyer/seller + reason)
```

Chi tiết endpoint, DTO, Flyway, FE — xem **Phần 5** trong bản gốc / sprint checklist.

---

## Phần 4–6: Đánh Giá Tính Năng, Câu Hỏi Gốc, Sprint Plan

Nội dung đầy đủ: giữ/không giữ tính năng, đơn giản hóa MEETING / dispute / modal, 3 sprint (A UX transaction, B auto-expire + quality, C security/observability).

---

## Phần 5: Migration Plan — 3 Sprint (Backlog)

### Sprint A — Transaction UX Fix (1–2 ngày)

- [x] BE: `POST /api/transactions/{id}/cancel` + `PATCH /status` có kiểm tra actor + transition hợp lệ (không hủy ACCEPTED qua PATCH — dùng cancel)
- [x] BE: `generateOtp` / `verifyOtp` chỉ khi `ACCEPTED` (hoặc `MEETING` legacy sau migration)
- [x] BE: OTP TTL 10 → 30 phút
- [x] BE: Flyway V12 (`cancel_reason`, `cancelled_at`, merge `MEETING` → `ACCEPTED`, index)
- [x] FE: Nút hủy + lý do (sau ACCEPTED); OTP khi `ACCEPTED`; hủy PENDING qua `POST .../cancel`
- [x] FE: Cập nhật `STATUS_CONFIG` / `TransactionGuidePage`

### Sprint B — Auto-expire + Quality

- [x] BE: `@Scheduled` (`TransactionExpiryScheduler`) + `TransactionExpiryService` — PENDING theo `created_at`, ACCEPTED/MEETING theo `updated_at`; cấu hình `educycle.transactions.expiry.*` (mặc định 48h / 168h, tắt trên profile `ci`)
- [x] FE/BE: nội quy giao dịch — cột `users.transaction_rules_accepted_at`, `GET /users/me` trả về; `POST /api/users/me/accept-transaction-rules`; FE `TransactionsPage` + migrate một lần từ `localStorage` cũ

### Sprint C — Security + Observability

- [x] BE: `RequestIdFilter` — header `X-Request-Id` + MDC cho log; pattern console có `%X{requestId}`
- [x] BE: Actuator — `/actuator/health/**` cho probes; **`GET /actuator/info` công khai** (phiên bản + `build` từ Maven `build-info`); `/actuator/prometheus` chỉ `permitAll` khi `EDUCYCLE_PROMETHEUS_PUBLIC=true` (mặc định false — cần JWT hoặc mạng nội bộ)
- [x] Micrometer: counter `educycle.transactions.expired` (tag `kind=pending|accepted`)
- TLS / reverse proxy / CI — vẫn theo Docker + nginx + GitHub Actions hiện có; không đổi infra trong sprint này.

---

## Đối chiếu với code hiện tại (bắt buộc khi implement)

> Cập nhật khi bắt đầu Sprint A để tránh hiểu sai.

| Điểm trong báo cáo | Thực tế trong repo (tại thời điểm lưu) |
|--------------------|----------------------------------------|
| OTP bị khóa BE ở MEETING | **`generateOtp`** chỉ kiểm tra **buyer**; **không** kiểm tra `ACCEPTED`/`MEETING`. Ràng buộc MEETING chủ yếu ở **FE** + **`openDispute`** (bắt `MEETING`). |
| OTP 10 phút | `TransactionServiceImpl.generateOtp`: `plus(10, MINUTES)` — đúng. |
| Huỷ sau ACCEPTED | **`PATCH /api/transactions/{id}/status`** tồn tại nhưng **không** kiểm tra actor (buyer/seller) / transition — **cần harden** khi làm cancel đúng nghĩa. |
| `POST .../cancel`, auto-expire | **`POST /api/transactions/{id}/cancel`** + job định kỳ hủy PENDING/ACCEPTED quá hạn → `CANCELLED` + lý do hệ thống. |

---

## Tài liệu liên quan

- [Architecture overview](README.md) — runtime và cấu trúc hiện tại
- [Backend README](../../backend/educycle-java/README.md)
- [Frontend README](../../frontend/README.md)

---

*EduCycle Redesign Report · Principal Engineer · 2026-03-26 · Lưu backlog: `docs/architecture/transaction-redesign-2026.md`*
