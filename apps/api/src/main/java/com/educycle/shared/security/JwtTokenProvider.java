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
import java.util.Optional;

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

    /**
     * Parses and verifies JWT once. Empty when missing, blank, expired, or malformed.
     * Prefer this over {@link #validateToken} + {@link #extractUserId} to avoid double parsing.
     */
    public Optional<Claims> parseValidClaims(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        if (!hasIssuerAndAudienceConfigured()) {
            log.error("JWT issuer/audience must be configured (jwt.issuer, jwt.audience)");
            return Optional.empty();
        }
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .requireIssuer(jwtProperties.getIssuer())
                    .requireAudience(jwtProperties.getAudience())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(claims);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token");
            log.debug("Invalid JWT token", e);
            return Optional.empty();
        }
    }

    private boolean hasIssuerAndAudienceConfigured() {
        String iss = jwtProperties.getIssuer();
        String aud = jwtProperties.getAudience();
        return iss != null && !iss.isBlank() && aud != null && !aud.isBlank();
    }

    public boolean validateToken(String token) {
        return parseValidClaims(token).isPresent();
    }

    public Claims extractClaims(String token) {
        return parseValidClaims(token)
                .orElseThrow(() -> new JwtException("Invalid JWT"));
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
