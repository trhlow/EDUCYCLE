package com.educycle.shared.response;

/**
 * JSON body cho HTTP 429 từ {@link com.educycle.shared.config.RateLimitFilter}.
 */
public record RateLimitJsonResponse(String error, int retryAfter) {
}
