package com.educycle.ai.application.service;

import com.educycle.ai.domain.AiKnowledgeChunk;
import com.educycle.ai.infrastructure.persistence.AiKnowledgeChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Truy xuất đoạn tri thức liên quan câu hỏi (cosine similarity trên embedding đã lưu).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagRetrievalService {

    private final AiKnowledgeChunkRepository chunkRepository;
    private final OpenAiEmbeddingService openAiEmbeddingService;

    @Value("${educycle.rag.enabled:true}")
    private boolean ragEnabled;

    @Value("${educycle.rag.top-k:5}")
    private int topK;

    @Value("${educycle.rag.min-cosine-similarity:0.28}")
    private double minCosineSimilarity;

    /**
     * Ghép block RAG vào system prompt nếu có dữ liệu và embedding query thành công.
     */
    @Transactional(readOnly = true)
    public String augmentSystemPrompt(String baseSystemPrompt, String userQuery) {
        if (!ragEnabled || userQuery == null || userQuery.isBlank()) {
            return baseSystemPrompt;
        }
        Optional<String> ctx = buildContextForQuery(userQuery.trim());
        if (ctx.isEmpty()) {
            return baseSystemPrompt;
        }
        return baseSystemPrompt + """

                ## Tài liệu tham khảo (RAG)
                Trả lời dựa trên các đoạn dưới đây khi chúng liên quan; nếu không đủ thông tin, dựa vào hướng dẫn hệ thống phía trên và không bịa chi tiết không có trong đoạn trích.

                """ + ctx.get();
    }

    public Optional<String> buildContextForQuery(String userQuery) {
        if (!ragEnabled || !openAiEmbeddingService.isConfigured()) {
            return Optional.empty();
        }

        List<AiKnowledgeChunk> indexed = chunkRepository.findByEmbeddingIsNotNull();
        if (indexed.isEmpty()) {
            return Optional.empty();
        }

        double[] queryVec;
        try {
            queryVec = openAiEmbeddingService.embed(userQuery);
        } catch (Exception e) {
            log.warn("RAG: embedding query failed: {}", e.getMessage());
            return Optional.empty();
        }

        record Scored(String title, String content, double score) {}

        List<Scored> scored = new ArrayList<>();
        for (AiKnowledgeChunk ch : indexed) {
            double[] emb = ch.getEmbedding();
            if (emb == null || emb.length == 0) {
                continue;
            }
            double sim = cosineSimilarity(queryVec, emb);
            if (sim >= minCosineSimilarity) {
                String t = ch.getTitle() != null ? ch.getTitle() : "Đoạn";
                scored.add(new Scored(t, ch.getContent(), sim));
            }
        }

        scored.sort(Comparator.comparingDouble(Scored::score).reversed());
        int k = Math.max(1, Math.min(topK, 12));
        if (scored.size() > k) {
            scored = scored.subList(0, k);
        }
        if (scored.isEmpty()) {
            return Optional.empty();
        }

        StringBuilder sb = new StringBuilder();
        int i = 1;
        for (Scored s : scored) {
            sb.append("### Đoạn ").append(i++).append(" (").append(s.title).append(")\n");
            sb.append(s.content).append("\n\n");
        }
        log.debug("RAG: selected {} chunks for query (minSim={})", scored.size(), minCosineSimilarity);
        return Optional.of(sb.toString().trim());
    }

    public static double cosineSimilarity(double[] a, double[] b) {
        if (a.length != b.length) {
            return -1;
        }
        double dot = 0;
        double na = 0;
        double nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) {
            return -1;
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }
}
