# Cursor + Git (EduCycle)

## Không đính trailer « Made-with: Cursor » vào commit

Khi bạn dùng **Cursor Agent** để tạo commit hoặc pull request, Cursor có thể **tự thêm** dòng attribution (ví dụ trailer kiểu `Made-with: Cursor`) vào message — đây là **cấu hình IDE**, không nằm trong hook Git của repo EduCycle.

**Tắt hoàn toàn:**

1. Mở **Cursor Settings** (Ctrl+,).
2. Vào **Agent** → **Attribution**.
3. **Tắt** tùy chọn attribution cho commit/PR.

Tài liệu chính thức: [Cursor — Git](https://cursor.com/docs/integrations/git).

Sau khi tắt, các commit do Agent tạo sẽ không còn đính trailer đó (trừ khi bạn tự gõ vào message).

## Commit bằng terminal (không qua Agent)

Nếu chỉ cần message thuần Conventional Commits, luôn có thể dùng Git trong terminal:

```powershell
git add path/to/file1 path/to/file2
git commit -m "feat(be): short description"
```

Quy ước dự án: `NOTES.md` §4 và `.cursor/rules/educycle.mdc` §6.

## Tham khảo repo khác (layout tài liệu / monorepo)

- **[deer-flow](https://github.com/bytedance/deer-flow)** — gợi ý tổ chức `docs/` theo mục (EduCycle: `docs/getting-started/`, `docs/architecture/`, …).
- **[MiroFish](https://github.com/666ghj/MiroFish)** — ví dụ layout app: `backend/` + `frontend/` ở root, script `npm run dev` / `docker compose`; EduCycle giữ code dưới `source/backend/educycle-java` và `source/frontend` (xem `docs/README.md`).
