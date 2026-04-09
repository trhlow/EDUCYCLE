# AI chatbot

EduCycle keeps all LLM provider keys on the backend. The browser only calls backend endpoints under `/api/ai/...`.

## Required backend env vars

- `ANTHROPIC_API_KEY` for the main chatbot provider

## Optional RAG env vars

- `OPENAI_API_KEY` for embedding generation
- `EDUCYCLE_RAG_ENABLED`
- `EDUCYCLE_RAG_TOP_K`
- `EDUCYCLE_RAG_MIN_COSINE`
- `EDUCYCLE_RAG_BOOTSTRAP`

Bootstrap content lives in:

- `backend/educycle-java/src/main/resources/rag/educycle-knowledge.md`

## Docker

Add provider keys to the root `.env` file, then restart the API service:

```env
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
```

## Local backend run

```powershell
cd backend\educycle-java
$env:ANTHROPIC_API_KEY="..."
mvn spring-boot:run
```

## Security notes

- Do not expose LLM keys through `VITE_*` variables.
- Keep AI traffic behind the backend proxy.
- Treat RAG bootstrap content as application data, not public credentials.

## Related docs

- [Root README](../../README.md)
- [Architecture overview](../architecture/README.md)
