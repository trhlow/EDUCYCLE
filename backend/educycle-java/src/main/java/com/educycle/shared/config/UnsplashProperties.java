package com.educycle.shared.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "unsplash")
public class UnsplashProperties {

    private String accessKey = "";
    private String apiBaseUrl = "https://api.unsplash.com";
    private long cacheTtlSeconds = 21600;

    public boolean isConfigured() {
        return accessKey != null && !accessKey.isBlank();
    }
}
