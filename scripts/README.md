# Scripts

Tiện ích chạy từ **root repo** (`EDUCYCLE/`).

| Script | Môi trường | Mục đích |
|--------|------------|----------|
| [verify.ps1](verify.ps1) | Windows PowerShell | `mvn clean verify` (BE) + `typecheck` + `build` (FE) — gần với bước kiểm tra trước push |
| [verify.sh](verify.sh) | Git Bash / Linux / macOS | Cùng logic |

Không thay thế CI đầy đủ (Playwright E2E, v.v.) — xem [.github/workflows/ci.yml](../.github/workflows/ci.yml).
