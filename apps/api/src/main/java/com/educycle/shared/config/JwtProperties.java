package com.educycle.shared.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.educycle.shared.util.MessageConstants;
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
    @NotBlank(message = MessageConstants.JWT_SECRET_REQUIRED)
    @Size(min = 32, message = MessageConstants.JWT_SECRET_TOO_SHORT)
    private String secret;
    private String issuer;
    private String audience;
    private long expirationHours = 2;
}
