package com.educycle.shared.security;

import com.educycle.shared.config.JwtProperties;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtTokenProvider")
class JwtTokenProviderTest {

    private JwtTokenProvider provider;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("abcdefghijklmnopqrstuvwxyz012345");
        props.setIssuer("EduCycle");
        props.setAudience("EduCycleUsers");
        provider = new JwtTokenProvider(props);
        provider.initSigningKey();
    }

    @Test
    @DisplayName("parseValidClaims returns empty for null, blank, or invalid token")
    void parseValidClaims_emptyWhenInvalid() {
        assertThat(provider.parseValidClaims(null)).isEmpty();
        assertThat(provider.parseValidClaims("")).isEmpty();
        assertThat(provider.parseValidClaims("   ")).isEmpty();
        assertThat(provider.parseValidClaims("not-a-jwt")).isEmpty();
    }

    @Test
    @DisplayName("parseValidClaims returns subject and role from generated token")
    void parseValidClaims_roundTrip() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .username("u")
                .email("u@student.edu.vn")
                .passwordHash("h")
                .role(Role.USER)
                .createdAt(Instant.now())
                .build();
        String jwt = provider.generateToken(user);

        Optional<Claims> claimsOpt = provider.parseValidClaims(jwt);

        assertThat(claimsOpt).isPresent();
        assertThat(claimsOpt.get().getSubject()).isEqualTo(id.toString());
        assertThat(claimsOpt.get().get("role", String.class)).isEqualTo("USER");
    }

    @Test
    @DisplayName("validateToken delegates to parseValidClaims")
    void validateToken_consistentWithParse() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .username("u")
                .email("u@student.edu.vn")
                .passwordHash("h")
                .role(Role.ADMIN)
                .createdAt(Instant.now())
                .build();
        String jwt = provider.generateToken(user);

        assertThat(provider.validateToken(jwt)).isTrue();
        assertThat(provider.validateToken(jwt + "tampered")).isFalse();
    }

    @Test
    @DisplayName("parseValidClaims rejects token with wrong issuer")
    void parseValidClaims_rejectsWrongIssuer() {
        JwtProperties props = jwtPropertiesForTest();
        SecretKey key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date exp = new Date(now.getTime() + 3_600_000L);
        UUID id = UUID.randomUUID();

        String token = Jwts.builder()
                .issuer("wrong-issuer")
                .audience().add(props.getAudience()).and()
                .subject(id.toString())
                .claim("role", "USER")
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();

        assertThat(provider.parseValidClaims(token)).isEmpty();
    }

    @Test
    @DisplayName("parseValidClaims rejects token with wrong audience")
    void parseValidClaims_rejectsWrongAudience() {
        JwtProperties props = jwtPropertiesForTest();
        SecretKey key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
        Date now = new Date();
        Date exp = new Date(now.getTime() + 3_600_000L);
        UUID id = UUID.randomUUID();

        String token = Jwts.builder()
                .issuer(props.getIssuer())
                .audience().add("wrong-audience").and()
                .subject(id.toString())
                .claim("role", "USER")
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();

        assertThat(provider.parseValidClaims(token)).isEmpty();
    }

    private static JwtProperties jwtPropertiesForTest() {
        JwtProperties props = new JwtProperties();
        props.setSecret("abcdefghijklmnopqrstuvwxyz012345");
        props.setIssuer("EduCycle");
        props.setAudience("EduCycleUsers");
        return props;
    }
}
