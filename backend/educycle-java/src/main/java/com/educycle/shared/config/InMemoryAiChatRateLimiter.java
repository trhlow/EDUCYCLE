package com.educycle.shared.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * In-memory token bucket — single instance only; bucket entries evict sau idle để tránh phình heap.
 */
@Component
@ConditionalOnProperty(name = "educycle.redis.enabled", havingValue = "false", matchIfMissing = true)
public class InMemoryAiChatRateLimiter implements AiChatRateLimiter {

    private static final int CAPACITY_PER_HOUR = 30;

    private final Cache<String, Bucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(50_000)
            .build();

    private static Bucket newBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(CAPACITY_PER_HOUR)
                        .refillGreedy(CAPACITY_PER_HOUR, Duration.ofHours(1))
                        .build())
                .build();
    }

    @Override
    public void consumeOrThrow(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        Bucket bucket = buckets.get(userId, k -> newBucket());
        if (!bucket.tryConsume(1)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều tin nhắn AI. Vui lòng thử lại sau.");
        }
    }
}
