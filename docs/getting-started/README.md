# Getting started

1. **Clone**
   ```bash
   git clone https://github.com/trhlow/EDUCYCLE.git
   cd EDUCYCLE
   ```

2. **Chọn môi trường**

   | Mục tiêu | Xem |
   |----------|-----|
   | Chạy full stack gần prod (Docker) | [README.md — Option 1: Docker Compose](../../README.md#option-1-docker-compose-recommended-for-demo) |
   | Dev FE + BE (hot reload) | [README.md — Option 2: Local development](../../README.md#option-2-local-development-recommended-for-coding) |

3. **Biến môi trường** — dùng [`.env.example`](../../.env.example) (root compose) và `source/frontend/.env.example` cho Vite.

4. **Kiểm tra trước khi push** — chạy [`scripts/verify.ps1`](../../scripts/verify.ps1) (Windows) hoặc [`scripts/verify.sh`](../../scripts/verify.sh) (Git Bash / Linux / macOS).
