package com.educycle.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@ConfigurationProperties(prefix = "cors")
public class CorsProperties {

    /**
     * Danh sách origin cho CORS + SockJS, phân tách bằng dấu phẩy.
     * Production: ghi đè bằng biến môi trường {@code CORS_ALLOWED_ORIGINS} (vd. {@code https://app.example.com,https://www.example.com}).
     */
    private String allowedOriginsCsv =
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost,http://127.0.0.1";

    public List<String> getAllowedOrigins() {
        return Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
