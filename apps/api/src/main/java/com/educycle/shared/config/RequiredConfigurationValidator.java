package com.educycle.shared.config;

import com.educycle.shared.util.MessageConstants;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RequiredConfigurationValidator {

    private static final String CHANGE_ME_PREFIX = "CHANGE_ME";
    private static final String PLACEHOLDER_PREFIX = "<";

    private final Environment environment;

    @PostConstruct
    void validateRequiredConfiguration() {
        List<String> missing = new ArrayList<>();
        requireText("spring.datasource.url", "SPRING_DATASOURCE_URL", missing);
        requireText("spring.datasource.username", "SPRING_DATASOURCE_USERNAME", missing);
        requireText("spring.datasource.password", "SPRING_DATASOURCE_PASSWORD", missing);
        requireText("jwt.secret", "JWT_SECRET", missing);

        String jwtSecret = environment.getProperty("jwt.secret");
        if (StringUtils.hasText(jwtSecret)) {
            if (jwtSecret.length() < 32) {
                missing.add("JWT_SECRET (min 32 chars)");
            }
            if (jwtSecret.startsWith(CHANGE_ME_PREFIX)) {
                missing.add("JWT_SECRET (must not be a placeholder)");
            }
            if (jwtSecret.startsWith(PLACEHOLDER_PREFIX)) {
                missing.add("JWT_SECRET (must not be an example placeholder)");
            }
        }

        if (isProductionProfile()) {
            requireText("cors.allowed-origins-csv", "CORS_ALLOWED_ORIGINS", missing);
        }

        if (!missing.isEmpty()) {
            throw new IllegalStateException(
                    MessageConstants.REQUIRED_CONFIG_MISSING_PREFIX + String.join(", ", missing));
        }
    }

    private void requireText(String propertyName, String envName, List<String> missing) {
        if (!StringUtils.hasText(environment.getProperty(propertyName))) {
            missing.add(envName);
        }
    }

    private boolean isProductionProfile() {
        for (String profile : environment.getActiveProfiles()) {
            if ("production".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }
}
