package com.educycle.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn gọi AI theo userId (JWT) — tránh spam tiêu hết quota Anthropic.
 * In-memory; multi-instance cần Redis sau này.
 */
@Component
public class AiChatRateLimiter {

    private static final int CAPACITY_PER_HOUR = 30;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public void consumeOrThrow(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        Bucket bucket = buckets.computeIfAbsent(
                userId,
                k -> Bucket.builder()
                        .addLimit(Bandwidth.builder()
                                .capacity(CAPACITY_PER_HOUR)
                                .refillGreedy(CAPACITY_PER_HOUR, Duration.ofHours(1))
                                .build())
                        .build());
        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều tin nhắn AI. Vui lòng thử lại sau.");
        }
    }
}
