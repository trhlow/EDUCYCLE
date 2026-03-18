package com.educycle.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

/**
 * Binds jwt.* properties from application.yml.
 * Secret MUST be injected via environment variable JWT_SECRET.
 */
@Getter
@Setter
@Component
@Validated
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    @NotBlank(message = "JWT secret must be configured via JWT_SECRET environment variable")
    private String secret;
    private String issuer;
    private String audience;
    private long expirationHours = 2;
}
