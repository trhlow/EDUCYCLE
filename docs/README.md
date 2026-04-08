# EduCycle — Documentation

> **Monorepo kiểu SaaS:** code chạy ở `backend/` (API) và `frontend/` (web); **mọi file Markdown dài** (kiến trúc, sprint, checklist) nằm trong **`docs/`** — root có **`README.md`** (tiếng Anh, GitHub mặc định) và **`README.vi.md`** (tiếng Việt).

## Bản đồ nhanh

| File / thư mục | Mục đích |
|----------------|----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Topology runtime, auth, WebSocket, audit (§10) |
| [NOTES.md](NOTES.md) | Trạng thái sprint, changelog, FE↔BE, quy tắc nội bộ, prompt AI |
| [SETUP_CHATBOT.md](SETUP_CHATBOT.md) | AI chat — entry; chi tiết: [guides/ai-chatbot.md](guides/ai-chatbot.md) |
| [PROJECT-COMPLETION.md](PROJECT-COMPLETION.md) | Đã làm vs nợ production (TLS, GDPR, …) |
| [references/code-review.md](references/code-review.md) | Checklist review + **3 bước** |
| [references/architecture.md](references/architecture.md) | Kế hoạch UX / responsive + **3 bước** |
| [getting-started/](getting-started/README.md) | Clone, Docker vs dev local |
| [architecture/](architecture/README.md) | Chỉ mục kiến trúc; backlog: [transaction-redesign-2026.md](architecture/transaction-redesign-2026.md) |
| [design/educycle/](design/educycle/MASTER.md) | Design system (token → `frontend/src/styles/tokens.css`) |
| [guides/](guides/ai-chatbot.md) | Hướng dẫn theo tính năng (AI, TLS, …) |
| [02-backend/](02-backend/README.md) | Ghi chú legacy — **API chính:** [backend/educycle-java/README.md](../backend/educycle-java/README.md) |
| [03-frontend/](03-frontend/README.md) | Ghi chú FE — **bản chính:** [frontend/README.md](../frontend/README.md) |

## Cửa ngõ repo

| File | Mục đích |
|------|----------|
| [README.md](../README.md) | English — clone, cấu hình, chạy nhanh, API tóm tắt |
| [README.vi.md](../README.vi.md) | Tiếng Việt — cùng nội dung, liên kết chéo với `README.md` |

## Đường dẫn vận hành

- Backend: `backend/educycle-java/`
- Frontend: `frontend/`
- CI: `.github/workflows/ci.yml`
- Docker: `docker-compose.yml` (root)

## CI/CD

- CI: `.github/workflows/ci.yml`
- CD: `.github/workflows/cd.yml`
- Huong dan deploy tu dong: [guides/cicd-auto-deploy.md](guides/cicd-auto-deploy.md)

## Frontend execution

- A/B/C roadmap va issue breakdown: [guides/frontend-abc-roadmap.md](guides/frontend-abc-roadmap.md)
- Lighthouse CI workflow: `.github/workflows/lighthouse.yml` + config `frontend/.lighthouserc.json`
- Accessibility smoke workflow: `.github/workflows/a11y-smoke.yml` (axe-core CLI on key routes)
