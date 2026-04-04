# EduCycle — UX / UI / frontend architecture planning

Dùng khi: responsive strategy, design system, làm màn mới, CWV, a11y pass, hoặc refactor component tree.

**Trước khi lập kế hoạch — 3 bước (bắt buộc trong repo này):**

1. **Phạm vi** — Trang / flow (vd. Dashboard, Transaction detail, Auth), breakpoint mục tiêu (mobile-first từ ~360px).
2. **Mục tiêu đo được** — Ví dụ: không CLS trên hero; form có label + error rõ; tap target ≥ token spacing.
3. **Bám template này** — Năm trụ dưới; mọi đề xuất trỏ về token/component hiện có trước khi tạo mới.

---

## 1. Responsiveness & cross-device

- Layout: mobile-first; kiểm tra navbar, bảng giao dịch, form dài.
- Tránh fixed width pixel; ưu tiên grid/flex + token spacing (`--space-*`).

## 2. Performance & smoothness (Core Web Vitals)

- Ảnh: lazy, kích thước hợp lý; tránh layout shift (chiều cao placeholder).
- List lớn: phân trang / ảo hóa nếu cần (đối chiếu `PageResponse` BE).
- TanStack Query: `staleTime` / refetch phù hợp từng loại dữ liệu (xem `QueryProvider`).

## 3. Design system

- **Nguồn sự thật:** `frontend/src/styles/tokens.css`.
- Chi tiết override theo trang: `docs/design/educycle/MASTER.md` + `NOTES.md` §9.

## 4. UX / UI best practices

- Hierarchy: một CTA chính mỗi viewport chính.
- Feedback: loading / error / empty state; toast qua pattern hiện có.
- **a11y:** `aria-label`, keyboard, focus visible; interactive = `<button>` hoặc role rõ.

## 5. Technical architecture (FE)

- Stack: React 19 + Vite 7 + JS (+ TS entry) + TanStack Query + Axios + STOMP.
- Context: tránh value object mới mỗi render nếu không cần (Auth, notifications).
- Routing: ưu tiên `navigate` thay vì `window.location` khi logout/401 (nếu đã wired event).

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| `NOTES.md` §9 | UI design rules chi tiết |
| `ARCHITECTURE.md` | Runtime, auth, WS |
| `references/code-review.md` | Review có cấu trúc |
