# 📅 Lịch commit đề xuất (theo khối lượng công việc)

**Khoảng thời gian:** 21/03/2026 → 20/04/2026  
**Nguyên tắc:**

1. **Một ngày duy nhất** cho toàn bộ việc **gộp repo + CI + tái cấu trúc thư mục/tài liệu** (đủ trong một phiên, không kéo cả tuần).
2. **Từ ngày tiếp theo trở đi** là **bắt tay làm tính năng / sửa lỗi** — mỗi mục được gán **mức độ** (nhẹ / vừa / nặng) để phân ngày cho hợp lý.
3. Các ngày **trống** hoặc ghi *dự phòng* dùng cho việc chưa kịp, review, hoặc hạng mục trong `PROJECT_AUDIT.md`.

Theo [GITFLOW.md](../GITFLOW.md) — Conventional Commits.

---

## ⚠️ Ngày cuối (20/04/2026)

1. **Xóa file này** khi không còn dùng làm checklist:
   ```powershell
   Remove-Item docs/COMMIT_CALENDAR_2026-03-21_to_04-20.md
   ```
2. (Tuỳ chọn) Ghi nhận trong `CHANGELOG.md` / `AI_CONTEXT.md`.

---

## Ngày 0 — Cấu trúc & tài liệu (1 ngày)

### 2026-03-21 (Thứ Bảy) — *khối lượng: gói “vỏ” monorepo + docs*

Tất cả có thể gói trong **một ngày làm việc** (hoặc 1–3 commit tùy bạn):

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `chore(repo): merge frontend + backend vào monorepo, giữ history (git filter-repo)` |
| 2 | `ci: GitHub Actions — Java 17 (mvn) + Node 20 (npm build)` |
| 3 | `chore(repo): root README, .gitignore, cây thư mục docs/` |
| 4 | `docs: CHANGELOG, docs/02-backend, docs/03-frontend, .github/copilot-instructions` |
| 5 | `chore(docs): gỡ file markdown trùng đã gộp vào CHANGELOG` |

> **Ghi chú:** Không tách “cả tuần chỉ làm folder” — **chỉ cần đúng một ngày** cho khối này; các ngày sau là **bắt tay code**.  
> *(22–23/03 có thể để trống — nghỉ cuối tuần / buffer — hoặc bắt đầu Phần A sớm hơn nếu team làm liền.)*

---

## Phần A — Module backend (theo độ nặng)

| Module | Độ nặng | Gợi ý commit |
|--------|---------|--------------|
| M1 Refresh token | Nặng (BE + FE + Flyway + test) | 2–3 commit |
| M2 CORS | Nhẹ | 1 commit |
| M3 Rate limiting | Nhẹ–vừa | 1 commit |
| M4 WebSocket chat | Nặng (BE + FE + deps) | 2–3 commit |
| M5 Notifications | Nặng (BE + DB + STOMP + FE) | 3–4 commit |

### 2026-03-24 (Thứ Ba)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(be/auth): refresh token — SecureRandom, Flyway V2, rotation, endpoints` |
| 2 | `feat(fe/auth): axios silent refresh + lưu refresh token` |
| 3 | `test(be/auth): cập nhật AuthServiceTest` |

### 2026-03-25 (Thứ Tư)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(be): CORS whitelist (CorsProperties + application.yml)` |

### 2026-03-26 (Thứ Năm)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(be): rate limiting — Bucket4j, filter, giới hạn auth vs API` |

### 2026-03-27 (Thứ Sáu)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(be/ws): WebSocket STOMP, JWT CONNECT, ChatController` |
| 2 | `feat(fe/ws): client STOMP/SockJS + TransactionDetailPage` |

### 2026-03-30 (Thứ Hai)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(be/notif): Flyway V3, NotificationService, REST + STOMP user queue` |
| 2 | `feat(be/notif): trigger thông báo từ Product/Transaction/Message` |
| 3 | `feat(fe/notif): NotificationContext + Navbar` |

---

## Phần B — Sửa audit FE + auth (từng bước nhỏ → gom ngày theo nhóm)

### 2026-03-31 (Thứ Ba)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `fix(fe): isAdmin + STATUS_CONFIG UPPERCASE (AuthContext, TransactionDetailPage, AuthPage)` |
| 2 | `docs: cập nhật AI_CONTEXT, PROJECT_AUDIT` |

### 2026-04-01 (Thứ Năm)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `security(fe): remove mock bypass trong AuthContext` |

### 2026-04-02 (Thứ Sáu)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(fe/auth): endpoints verifyOtp, resendOtp, socialLogin, verifyPhone` |
| 2 | `feat(fe/auth): AuthContext — verifyOtp, resendOtp, socialLogin, verifyPhone` |

### 2026-04-03 (Chủ Nhật)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `feat(fe/auth): OTP step sau đăng ký (AuthPage)` |

---

## Phần C — Ổn định chạy app (white screen, session, build)

### 2026-04-07 (Thứ Ba)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `fix(fe): localStorage an toàn — cart, wishlist` |
| 2 | `fix(fe): notifications state luôn là mảng + Navbar defensive` |

### 2026-04-08 (Thứ Năm)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `refactor(fe/auth): safeSession — đồng bộ token/user` |
| 2 | `feat(fe): ErrorBoundary` |
| 3 | `fix(fe): axios clearAuthStorage khi 401/refresh fail` |

### 2026-04-09 (Thứ Sáu)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `fix(fe): sockjs global — index.html + Vite define + optimizeDeps` |
| 2 | `chore(fe): nhắc xóa node_modules/.vite khi đổi cấu hình` |

### 2026-04-10 (Chủ Nhật)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `test(be): TransactionServiceTest — mock NotificationService` |

---

## Phần D — Dự phòng theo PROJECT_AUDIT (11/04 → 19/04)

Khối lượng gợi ý (chọn ngày và tách commit tùy team):

- **V4** `updatedAt` transaction + migration  
- **JWT** đưa secret ra env  
- **N+1** reviews trong `ProductServiceImpl`  
- **Dọn** dependency FE không dùng  

Có thể **1–2 commit/tuần** hoặc gom **một ngày cuối tuần** nếu ít thay đổi.

---

## Ngày kết thúc lịch

### 2026-04-20 (Thứ Hai)

| # | Commit message (gợi ý) |
|---|-------------------------|
| 1 | `docs: tổng kết giai đoạn (CHANGELOG / AI_CONTEXT)` |
| 2 | `chore(docs): remove docs/COMMIT_CALENDAR_2026-03-21_to_04-20.md` |

---

## Ghi chú

- Lịch trên là **đề xuất phân bổ theo khối lượng**, không cố định ngày nếu team làm nhanh/chậm hơn.
- **Tái cấu trúc folder/docs = 1 ngày (21/03)**; mọi thứ còn lại là **công việc phát triển thật**, chia nhỏ commit cho dễ review.

---

*Tạo theo nội dung phiên làm việc; xóa file sau 20/04/2026 nếu không còn dùng.*
