# AI Chatbot (Anthropic qua backend)

EduCycle **không** đặt API key LLM trong bundle frontend. Trình duyệt chỉ gọi **`POST /api/ai/chat`** trên backend; server gọi Anthropic (nếu đã cấu hình).

## Yêu cầu

- Biến môi trường **`ANTHROPIC_API_KEY`** trên **tiến trình Spring Boot** (Docker service `api` hoặc `mvn spring-boot:run`).
- Rate limit: xem `AiChatRateLimiter` / Redis (production) — chi tiết trong [NOTES.md](../../NOTES.md).

## Docker (root `docker-compose`)

Trong `.env` cạnh `docker-compose.yml` (không commit file thật):

```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Rebuild / khởi động lại service `api` sau khi thêm key.

## Dev local

```powershell
cd source/backend/educycle-java
$env:ANTHROPIC_API_KEY="sk-ant-..."
mvn spring-boot:run
```

Hoặc đặt trong `application.yml` chỉ profile dev — **không** commit secret.

## Frontend

Widget chat gọi endpoint đã proxy qua Vite (`/api/...`). Không cần `VITE_*` cho Anthropic.

## Xem thêm

- [SETUP_CHATBOT.md](../../SETUP_CHATBOT.md) — entry ngắn ở root
- [README.md — AI Chatbot](../../README.md#ai-chatbot)
