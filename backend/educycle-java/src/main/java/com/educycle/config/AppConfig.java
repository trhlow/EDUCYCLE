package com.educycle.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * General application beans.
 *
 * ObjectMapper replaces C# System.Text.Json.JsonSerializer used in ProductService
 * for serializing/deserializing the ImageUrls JSON array stored as a TEXT column.
 */
@Configuration
public class AppConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        // Spring Boot dùng bean này cho @RequestBody — mặc định Jackson từ chối field lạ (vd. priceType từ FE).
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }
}
