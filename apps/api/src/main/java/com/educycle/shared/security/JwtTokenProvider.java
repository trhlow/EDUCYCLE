package com.educycle.shared.security;

import com.educycle.shared.config.JwtProperties;
import com.educycle.user.domain.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;

/**
 * Replaces C# JwtTokenGenerator / IJwtTokenGenerator.
 *
 * Key changes:
 *  - Microsoft.IdentityModel.Tokens → io.jsonwebtoken (JJWT 0.12.x)
 *  - Claims: sub = userId (UUID), email, role
 *  - Expiry: now + expirationHours (from JwtProperties)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;

    private SecretKey signingKey;

    @PostConstruct
    void initSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    // ===== Generate Token =====

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getExpirationHours() * 3_600_000L);

        return Jwts.builder()
                .subject(user.getId().toString())           // maps C# ClaimTypes.Sub
                .claim("email", user.getEmail())            // maps C# JwtRegisteredClaimNames.Email
                .claim("role", user.getRole().name())       // maps C# ClaimTypes.Role
                .issuer(jwtProperties.getIssuer())
                .audience().add(jwtProperties.getAudience()).and()
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Opaque refresh token — SecureRandom 64 bytes, URL-safe Base64 (no UUID).
     */
    public String generateRefreshToken() {
        byte[] randomBytes = new byte[64];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    // ===== Validate & Extract =====

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // ===== Private Helpers =====

    private SecretKey getSigningKey() {
        return signingKey;
    }
}
