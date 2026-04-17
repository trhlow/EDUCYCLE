package com.educycle.shared.config;

import com.educycle.shared.util.MessageConstants;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
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
import java.util.concurrent.TimeUnit;

/**
 * IP-based rate limiting (in-memory, no Redis needed for MVP).
 *
 * Auth endpoints (login/register/resend-otp): 10 req / minute
 * All other API endpoints:                   60 req / minute
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "educycle.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${educycle.rate-limit.prefer-x-real-ip:false}")
    private boolean preferXRealIp;

    private final Cache<String, Bucket> authBuckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(50_000)
            .build();

    private final Cache<String, Bucket> apiBuckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(50_000)
            .build();

    private static Bucket newAuthBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(10)
                        .refillGreedy(10, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    private static Bucket newApiBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(60)
                        .refillGreedy(60, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    private Bucket getAuthBucket(String ip) {
        return authBuckets.get(ip, k -> newAuthBucket());
    }

    private Bucket getApiBucket(String ip) {
        return apiBuckets.get(ip, k -> newApiBucket());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String method = request.getMethod();
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }
        String path = request.getRequestURI();
        return path.startsWith("/actuator/health") || path.startsWith("/actuator/info");
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
