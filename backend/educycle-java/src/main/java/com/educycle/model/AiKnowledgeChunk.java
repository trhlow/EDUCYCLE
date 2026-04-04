package com.educycle.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Một đoạn tri thức cho RAG chatbot (nội dung + embedding tùy chọn).
 */
@Entity
@Table(name = "ai_knowledge_chunk")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiKnowledgeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "source_key", nullable = false, length = 512)
    private String sourceKey;

    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;

    @Column(name = "title", length = 512)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    /** null = chưa index embedding (hoặc môi trường không bật OpenAI). */
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "embedding", columnDefinition = "double precision[]")
    private double[] embedding;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
