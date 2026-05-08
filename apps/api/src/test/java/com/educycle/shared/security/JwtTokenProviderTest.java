package com.educycle.shared.security;

import com.educycle.shared.config.JwtProperties;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
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
}
