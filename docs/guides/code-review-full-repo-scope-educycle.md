# EduCycle — Phạm vi review / fix **toàn repo** (full project)

File này bổ sung **phạm vi** cho hai prompt strict; không thay thế chúng.

| Việc | Prompt nền (bắt buộc dán trước) |
| ---- | -------------------------------- |
| Review | [`code-review-prompt-educycle-strict.md`](./code-review-prompt-educycle-strict.md) |
| Sửa theo review | [`code-fix-from-review-prompt-educycle-strict.md`](./code-fix-from-review-prompt-educycle-strict.md) |

**Bối cảnh nhanh:** `docs/README.md`, `docs/architecture/README.md`.

---

## Phạm vi bổ sung — TOÀN BỘ DỰ ÁN (full repo)

Dán khối sau **ngay sau** prompt review strict khi muốn audit cả dự án:

- **Workspace / repo:** EduCycle root (đọc `docs/README.md`, `docs/architecture/README.md` nếu cần bối cảnh).
- **Phạm vi kỹ thuật:** toàn bộ phần đang trong repo có ý nghĩa production, gồm tối thiểu:
  - **Backend:** `apps/api/` (Spring Boot, security, JWT, Flyway, controllers/services, tests).
  - **Frontend:** `apps/web/` (React/Vite, auth, API, WS, tokens CSS).
  - **DB / vận hành:** migrations Flyway, `docker-compose*`, CI workflow nếu ảnh hưởng build/deploy/security.
- **Cách làm:** coi đây như “release audit” — ưu tiên **P0 → P1 → P2 → P3**, rồi đề xuất (U). Nếu không đủ thời gian/chỗ để cover hết từng file, phải ghi rõ **phần repo chưa quét** và **vì sao** (không được im lặng như đã review hết).
- **Đầu ra:** vẫn **đúng thứ tự #0–#11** trong prompt strict; trong **#0 Scope** liệt kê module đã xem xét và module **chưa đủ bằng chứng**.

---

## Phạm vi bổ sung — SỬA THEO REVIEW TRÊN TOÀN REPO

Dán khối sau **sau** prompt **fix** strict + **toàn bộ** (hoặc phần rút gọn có P/U rõ) **output review**:

- **Áp dụng finding** trên toàn codebase EduCycle (BE + FE + DB/CI nếu review có nhắc), không chỉ một PR nhỏ.
- **Không** mở rộng ngoài finding/đề xuất **đã có trong review** (đúng strict guide: phạm vi A/B).
- **Ưu tiên:** P0/P1 trước; tách **nhiều commit theo domain** nếu review lớn (auth / listing / …) — không gộp không liên quan.
- Nếu review full-repo quá lớn: làm **batch** — trong báo cáo cuối ghi rõ **đã fix mục nào / còn mục nào** và lý do (cần migration riêng, cần quyết định PM, v.v.).
