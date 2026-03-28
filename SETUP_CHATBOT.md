# AI Chatbot — quick setup

> Chi tiết: [docs/guides/ai-chatbot.md](docs/guides/ai-chatbot.md)

1. Đặt **`ANTHROPIC_API_KEY`** trên **backend** (Docker `api` hoặc `mvn spring-boot:run`).
2. **RAG (tuỳ chọn):** đặt **`OPENAI_API_KEY`** để embedding + truy xuất chunk từ bảng `ai_knowledge_chunk`. Lần đầu bảng trống, app tự nạp `classpath:rag/educycle-knowledge.md` (tắt: `EDUCYCLE_RAG_BOOTSTRAP=false`). Không có OpenAI thì chat vẫn chạy với system prompt cố định.
3. Frontend chỉ gọi **`POST /api/ai/chat`** — không nhúng key LLM vào Vite.
4. Xem rate limit và biến môi trường trong [NOTES.md](NOTES.md).
