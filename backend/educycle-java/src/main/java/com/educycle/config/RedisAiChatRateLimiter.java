package com.educycle.config;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import redis.clients.jedis.JedisPooled;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Fixed-window counter per user per hour — safe across multiple API replicas.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "educycle.redis.enabled", havingValue = "true")
public class RedisAiChatRateLimiter implements AiChatRateLimiter {

    private static final int CAPACITY_PER_HOUR = 30;
    private static final DateTimeFormatter HOUR_KEY = DateTimeFormatter.ofPattern("yyyyMMddHH");

    @Value("${educycle.redis.host:localhost}")
    private String host;

    @Value("${educycle.redis.port:6379}")
    private int port;

    private JedisPooled jedis;

    @PostConstruct
    void connect() {
        jedis = new JedisPooled(host, port);
        log.info("AI rate limit: Redis at {}:{}", host, port);
    }

    @PreDestroy
    void close() {
        if (jedis != null) {
            try {
                jedis.close();
            } catch (Exception e) {
                log.debug("Jedis close: {}", e.getMessage());
            }
        }
    }

    @Override
    public void consumeOrThrow(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        String hour = ZonedDateTime.now().format(HOUR_KEY);
        String key = "educycle:ai:chat:" + userId + ":" + hour;
        long n = jedis.incr(key);
        if (n == 1L) {
            jedis.expire(key, 7200);
        }
        if (n > CAPACITY_PER_HOUR) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã gửi quá nhiều tin nhắn AI. Vui lòng thử lại sau.");
        }
    }
}
