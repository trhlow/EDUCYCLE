-- RAG: tri thức nội bộ cho chatbot (embedding = float8[], không cần extension pgvector).
CREATE TABLE ai_knowledge_chunk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_key VARCHAR(512) NOT NULL,
    chunk_index INTEGER NOT NULL DEFAULT 0,
    title VARCHAR(512),
    content TEXT NOT NULL,
    embedding DOUBLE PRECISION[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ai_knowledge_source_chunk UNIQUE (source_key, chunk_index)
);

CREATE INDEX idx_ai_knowledge_chunk_source ON ai_knowledge_chunk (source_key);
