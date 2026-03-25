# Scripts

Tiện ích chạy từ **root repo** (`EDUCYCLE/`).

| Script | Môi trường | Mục đích |
|--------|------------|----------|
| [verify.ps1](verify.ps1) | Windows PowerShell | `mvn clean verify` (BE) + `typecheck` + `build` (FE) — gần với bước kiểm tra trước push |
| [verify.sh](verify.sh) | Git Bash / Linux / macOS | Cùng logic |
| [strip_cursor_commit_messages.py](strip_cursor_commit_messages.py) | Python 3 + [git-filter-repo](https://github.com/newren/git-filter-repo) | Viết lại **toàn bộ** message commit: bỏ dòng `Made-with: Cursor` (chỉ khi repo chưa share / chấp nhận force push) |

Không thay thế CI đầy đủ (Playwright E2E, v.v.) — xem [.github/workflows/ci.yml](../.github/workflows/ci.yml).
