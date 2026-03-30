# EduCycle — Documentation

> Cấu trúc gợi ý theo hướng tách **tài liệu theo mục** (tương tự tinh thần [deer-flow](https://github.com/bytedance/deer-flow) `docs/`). Code ở root: `backend/educycle-java/`, `frontend/`.

## Mục lục

| Thư mục / file | Nội dung |
|----------------|----------|
| [getting-started/](getting-started/README.md) | Clone, chọn Docker vs dev local, đường dẫn nhanh |
| [architecture/](architecture/README.md) | Topology, auth, WebSocket — trỏ về `ARCHITECTURE.md` ở root; backlog tái thiết kế giao dịch: [architecture/transaction-redesign-2026.md](architecture/transaction-redesign-2026.md) |
| [design/educycle/](design/educycle/MASTER.md) | Design system / override theo trang (token → `frontend/src/styles/tokens.css`) |
| [guides/](guides/ai-chatbot.md) | Hướng dẫn theo tính năng (AI chatbot, [production TLS](guides/production-tls.md), …) |
| [02-backend/](02-backend/README.md) | Ghi chú legacy / so sánh migration — **bản chính API:** [`backend/educycle-java/README.md`](../backend/educycle-java/README.md) |
| [03-frontend/](03-frontend/README.md) | Tổng quan FE — **bản chính:** [`frontend/README.md`](../frontend/README.md) |

## Tài liệu ở root repo (canonical)

| File | Mục đích |
|------|----------|
| [README.md](../README.md) | Chạy app, cấu hình, API tóm tắt |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | Kiến trúc runtime, audit |
| [NOTES.md](../NOTES.md) | Sprint, changelog, quy tắc nội bộ, FE↔BE |
| [PROJECT-COMPLETION.md](PROJECT-COMPLETION.md) | Tổng hợp đã làm vs nợ prod (TLS, S3, GDPR, …) |
| [SETUP_CHATBOT.md](../SETUP_CHATBOT.md) | AI chat — entry ngắn, chi tiết trong `guides/` |

## Đường dẫn code

- Backend: `backend/educycle-java/`
- Frontend: `frontend/`
- CI: `.github/workflows/ci.yml`
- Docker: `docker-compose.yml` (root)
