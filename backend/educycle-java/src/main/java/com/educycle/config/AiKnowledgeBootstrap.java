package com.educycle.config;

import com.educycle.model.AiKnowledgeChunk;
import com.educycle.repository.AiKnowledgeChunkRepository;
import com.educycle.service.OpenAiEmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Nạp file {@code classpath:rag/educycle-knowledge.md} và tạo embedding lần đầu (bảng trống + có OpenAI key).
 */
@Slf4j
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@RequiredArgsConstructor
public class AiKnowledgeBootstrap implements ApplicationRunner {

    private static final String RESOURCE_PATH = "rag/educycle-knowledge.md";
    private static final String SOURCE_KEY = "classpath:rag/educycle-knowledge.md";

    private final AiKnowledgeChunkRepository chunkRepository;
    private final OpenAiEmbeddingService openAiEmbeddingService;

    @Value("${educycle.rag.bootstrap-enabled:true}")
    private boolean bootstrapEnabled;

    @Override
    public void run(ApplicationArguments args) {
        if (!bootstrapEnabled) {
            return;
        }
        if (!openAiEmbeddingService.isConfigured()) {
            log.info("RAG bootstrap skipped: OPENAI_API_KEY not set (chunks can be added later)");
            return;
        }
        if (chunkRepository.count() > 0) {
            return;
        }

        try {
            ClassPathResource res = new ClassPathResource(RESOURCE_PATH);
            if (!res.exists()) {
                log.warn("RAG bootstrap: missing resource {}", RESOURCE_PATH);
                return;
            }
            String md = StreamUtils.copyToString(res.getInputStream(), StandardCharsets.UTF_8);
            List<Section> sections = splitByMarkdownSections(md);
            if (sections.isEmpty()) {
                log.warn("RAG bootstrap: no sections parsed from {}", RESOURCE_PATH);
                return;
            }

            List<String> embedInputs = new ArrayList<>();
            for (Section s : sections) {
                embedInputs.add(s.title() + "\n" + s.body());
            }

            List<double[]> vectors = openAiEmbeddingService.embedBatch(embedInputs);
            List<AiKnowledgeChunk> toSave = new ArrayList<>();
            for (int i = 0; i < sections.size(); i++) {
                Section s = sections.get(i);
                toSave.add(AiKnowledgeChunk.builder()
                        .sourceKey(SOURCE_KEY)
                        .chunkIndex(i)
                        .title(s.title())
                        .content(s.body())
                        .embedding(vectors.get(i))
                        .build());
            }
            chunkRepository.saveAll(toSave);
            log.info("RAG bootstrap: indexed {} chunks from {}", toSave.size(), RESOURCE_PATH);
        } catch (Exception e) {
            log.warn("RAG bootstrap failed (app continues without indexed chunks): {}", e.getMessage());
            log.debug("RAG bootstrap stack trace", e);
        }
    }

    private record Section(String title, String body) {}

    private List<Section> splitByMarkdownSections(String md) {
        List<Section> out = new ArrayList<>();
        String[] lines = md.split("\r?\n");
        StringBuilder body = new StringBuilder();
        String title = "EduCycle";
        boolean seenFirstHeading = false;

        for (String line : lines) {
            if (line.startsWith("## ")) {
                if (seenFirstHeading && body.length() > 0) {
                    out.add(new Section(title, body.toString().trim()));
                    body = new StringBuilder();
                }
                title = line.substring(3).trim();
                seenFirstHeading = true;
            } else if (line.startsWith("# ") && !line.startsWith("##")) {
                if (!seenFirstHeading) {
                    title = line.substring(2).trim();
                }
            } else {
                body.append(line).append('\n');
            }
        }
        if (seenFirstHeading && body.length() > 0) {
            out.add(new Section(title, body.toString().trim()));
        }
        return out;
    }
}
