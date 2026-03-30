package com.educycle.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token bucket — single instance only.
 */
@Component
@ConditionalOnProperty(name = "educycle.redis.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryAiChatRateLimiter implements AiChatRateLimiter {

    private static final int CAPACITY_PER_HOUR = 30;

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
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
