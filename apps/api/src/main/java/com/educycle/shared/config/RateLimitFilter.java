package com.educycle.shared.config;

import com.educycle.shared.response.RateLimitJsonResponse;
import com.educycle.shared.util.MessageConstants;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * IP-based rate limiting (in-memory, no Redis needed for MVP).
 * Quotas are enforced per JVM instance. Multi-instance production deployments need a shared
 * limiter at Redis / API gateway / reverse proxy layer to avoid multiplying effective limits.
 *
 * Auth endpoints (login/register/resend-otp): 10 req / minute
 * Transaction OTP (generate/verify): stricter per transaction id + IP (see {@link TransactionOtpProperties})
 * All other API endpoints:                   60 req / minute
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(name = "educycle.rate-limit.enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Pattern TX_VERIFY_OTP_PATH =
            Pattern.compile("^/api/transactions/([0-9a-fA-F-]{36})/verify-otp$");
    private static final Pattern TX_GENERATE_OTP_PATH =
            Pattern.compile("^/api/transactions/([0-9a-fA-F-]{36})/otp$");

    private final TransactionOtpProperties transactionOtpProperties;
    private final ObjectMapper objectMapper;

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

    private final Cache<String, Bucket> otpVerifyBuckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(50_000)
            .build();

    private final Cache<String, Bucket> otpGenerateBuckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(50_000)
            .build();

    private Bucket newOtpVerifyBucket() {
        int cap = Math.max(1, transactionOtpProperties.getHttpVerifyPerMinute());
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(cap)
                        .refillGreedy(cap, Duration.ofMinutes(1))
                        .build())
                .build();
    }

    private Bucket newOtpGenerateBucket() {
        int cap = Math.max(1, transactionOtpProperties.getHttpGeneratePerWindow());
        int windowMinutes = Math.max(1, transactionOtpProperties.getHttpGenerateWindowMinutes());
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(cap)
                        .refillGreedy(cap, Duration.ofMinutes(windowMinutes))
                        .build())
                .build();
    }

    private Bucket getOtpVerifyBucket(String key) {
        return otpVerifyBuckets.get(key, k -> newOtpVerifyBucket());
    }

    private Bucket getOtpGenerateBucket(String key) {
        return otpGenerateBuckets.get(key, k -> newOtpGenerateBucket());
    }

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
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method)) {
            Matcher verifyMatcher = TX_VERIFY_OTP_PATH.matcher(path);
            if (verifyMatcher.matches()) {
                String txId = verifyMatcher.group(1);
                String otpKey = ip + ":otp:verify:" + txId;
                if (!getOtpVerifyBucket(otpKey).tryConsume(1)) {
                    writeTooManyRequests(response, 60);
                    return;
                }
                chain.doFilter(request, response);
                return;
            }
            Matcher genMatcher = TX_GENERATE_OTP_PATH.matcher(path);
            if (genMatcher.matches()) {
                String txId = genMatcher.group(1);
                String otpKey = ip + ":otp:generate:" + txId;
                if (!getOtpGenerateBucket(otpKey).tryConsume(1)) {
                    int windowSec = Math.max(60, transactionOtpProperties.getHttpGenerateWindowMinutes() * 60);
                    writeTooManyRequests(response, windowSec);
                    return;
                }
                chain.doFilter(request, response);
                return;
            }
        }

        boolean isAuthPath = path.startsWith("/api/auth/login")
                || path.startsWith("/api/auth/register")
                || path.startsWith("/api/auth/resend-otp");

        Bucket bucket = isAuthPath ? getAuthBucket(ip) : getApiBucket(ip);

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            writeTooManyRequests(response, 60);
        }
    }

    private void writeTooManyRequests(HttpServletResponse response, int retryAfterSeconds)
            throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.setContentType("application/json;charset=UTF-8");
        objectMapper.writeValue(
                response.getWriter(),
                new RateLimitJsonResponse(MessageConstants.TOO_MANY_REQUESTS, retryAfterSeconds));
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
