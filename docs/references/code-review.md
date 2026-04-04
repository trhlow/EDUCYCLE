# EduCycle — Code review checklist (full-stack)

Dùng khi: PR review, audit bảo mật/hiệu năng, hoặc nhờ AI phân tích có cấu trúc.

**Trước khi bắt đầu — 3 bước (bắt buộc trong repo này):**

1. **Mục tiêu cụ thể** — Liệt kê file / endpoint / component (vd. `TransactionServiceImpl`, `AuthContext.jsx`), không chỉ “review toàn bộ”.
2. **Mục đích** — Ưu tiên một trong: bảo mật · bug · hiệu năng · UX/a11y · convention EduCycle.
3. **Áp template này** — Trả lời theo 5 khối dưới; mỗi finding ghi **mức độ** + **vị trí** (file + symbol / dòng).

---

## Mức độ

| Nhãn | Ý nghĩa |
|------|---------|
| Critical | Khai thác được / mất dữ liệu / downtime |
| High | Bug nghiệp vụ nặng / lộ PII / authz sai |
| Medium | Regression risk, N+1, a11y form |
| Low | Style, đặt tên, comment |

---

## 1. Code quality

- Naming, kích thước hàm, DRY, pattern service/controller/DTO của BE (`*ServiceImpl`, records).
- FE: `const` + prefix `handle*`, không hardcode màu/px (chỉ `var(--*)` từ `frontend/src/styles/tokens.css`).

## 2. Bug detection

- Null/optional, race (transaction + product), async (SSE, refresh token, Query).
- Status enum: luôn so sánh **UPPERCASE** ở FE.

## 3. Security

- AuthN/AuthZ, lộ PII trong DTO, upload file, rate limit, JWT/OTP.
- Không log secret; không commit `.env`.

## 4. Performance

- N+1 JPA, full table scan, map không giới hạn (rate limit), render thừa (context value).

## 5. Best practices

- Flyway: không sửa migration đã apply; file mới tăng version (xem `NOTES.md` §1).
- Git: một commit một domain; không `git add .` (xem `NOTES.md` §4).

---

## Gợi ý đường dẫn thường xem

| Khu vực | Path |
|---------|------|
| API / nghiệp vụ | `backend/educycle-java/src/main/java/com/educycle/` |
| Auth FE | `frontend/src/context/AuthContext.jsx`, `frontend/src/utils/safeSession.js` |
| API client | `frontend/src/api/` |
| Design tokens | `frontend/src/styles/tokens.css` |
| Kiến trúc tổng | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
