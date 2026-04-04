package com.educycle.config;

/**
 * Per-user quota for AI chat (JWT subject = userId).
 */
public interface AiChatRateLimiter {

    void consumeOrThrow(String userId);
}
