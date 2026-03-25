# AI Chatbot — quick setup

> Chi tiết: [docs/guides/ai-chatbot.md](docs/guides/ai-chatbot.md)

1. Đặt **`ANTHROPIC_API_KEY`** trên **backend** (Docker `api` hoặc `mvn spring-boot:run`).
2. Frontend chỉ gọi **`POST /api/ai/chat`** — không nhúng key vào Vite.
3. Xem rate limit và biến môi trường trong [NOTES.md](NOTES.md).
