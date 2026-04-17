package com.educycle.ai.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Embeddings qua OpenAI (tuỳ chọn) — dùng cho RAG; key không gửi xuống frontend.
 */
@Slf4j
@Service
public class OpenAiEmbeddingService {

    private static final String OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";
    private static final int EXPECTED_DIM = 1536;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.embedding-model:text-embedding-3-small}")
    private String embeddingModel;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Một văn bản → một vector (1536 chiều với text-embedding-3-small).
     */
    public double[] embed(String input) throws Exception {
        List<double[]> batch = embedBatch(List.of(input));
        return batch.get(0);
    }

    /**
     * Nhiều văn bản trong một request (thứ tự giữ nguyên).
     */
    public List<double[]> embedBatch(List<String> inputs) throws Exception {
        if (!isConfigured()) {
            throw new IllegalStateException("OpenAI API key not configured");
        }
        if (inputs == null || inputs.isEmpty()) {
            return List.of();
        }

        var body = MAPPER.writeValueAsString(Map.of(
                "model", embeddingModel,
                "input", inputs
        ));

        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(OPENAI_EMBEDDINGS_URL))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(60))
                .build();

        HttpResponse<String> res = HTTP_CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) {
            log.error("OpenAI embeddings error: status={}, body={}", res.statusCode(), res.body());
            throw new IllegalStateException("OpenAI embeddings HTTP " + res.statusCode());
        }

        JsonNode root = MAPPER.readTree(res.body());
        JsonNode data = root.get("data");
        if (data == null || !data.isArray()) {
            throw new IllegalStateException("OpenAI embeddings: missing data array");
        }

        List<double[]> out = new ArrayList<>(inputs.size());
        for (int i = 0; i < inputs.size(); i++) {
            out.add(null);
        }

        for (JsonNode item : data) {
            int index = item.path("index").asInt(-1);
            JsonNode emb = item.get("embedding");
            if (index < 0 || index >= inputs.size() || emb == null || !emb.isArray()) {
                throw new IllegalStateException("OpenAI embeddings: invalid item");
            }
            double[] vec = new double[emb.size()];
            for (int j = 0; j < emb.size(); j++) {
                vec[j] = emb.get(j).asDouble();
            }
            if (vec.length != EXPECTED_DIM) {
                log.warn("Unexpected embedding dimension: {} (expected {})", vec.length, EXPECTED_DIM);
            }
            out.set(index, vec);
        }

        for (int i = 0; i < out.size(); i++) {
            if (out.get(i) == null) {
                throw new IllegalStateException("OpenAI embeddings: missing index " + i);
            }
        }
        return out;
    }
}
