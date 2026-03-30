package com.educycle.config;

import com.educycle.util.MessageConstants;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP-based rate limiting (in-memory, no Redis needed for MVP).
 *
 * Auth endpoints (login/register/resend-otp): 5 req / minute
 * All other API endpoints:                   60 req / minute
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "educycle.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${educycle.rate-limit.prefer-x-real-ip:false}")
    private boolean preferXRealIp;

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets = new ConcurrentHashMap<>();

    private Bucket getAuthBucket(String ip) {
        return authBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.builder()
                                .capacity(10)
                                .refillGreedy(10, Duration.ofMinutes(1))
                                .build())
                        .build()
        );
    }

    private Bucket getApiBucket(String ip) {
        return apiBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.builder()
                                .capacity(60)
                                .refillGreedy(60, Duration.ofMinutes(1))
                                .build())
                        .build()
        );
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String ip = getClientIp(request);
        String path = request.getRequestURI();

        boolean isAuthPath = path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/resend-otp");

        Bucket bucket = isAuthPath ? getAuthBucket(ip) : getApiBucket(ip);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"error\":\"" + MessageConstants.TOO_MANY_REQUESTS + "\",\"retryAfter\":60}"
            );
        }
    }

    /**
     * Chỉ tin {@code X-Real-IP} khi reverse proxy (nginx) gán từ {@code $remote_addr}.
     * Không đọc X-Forwarded-For thô — client có thể giả mạo.
     */
    private String getClientIp(HttpServletRequest request) {
        if (preferXRealIp) {
            String xri = request.getHeader("X-Real-IP");
            if (StringUtils.hasText(xri)) {
                return xri.trim();
            }
        }
        return request.getRemoteAddr();
    }
}
