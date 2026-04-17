package com.educycle.media.infrastructure.client;

import com.educycle.shared.config.UnsplashProperties;
import com.educycle.media.application.service.UnsplashMediaService;
import com.educycle.media.api.dto.response.UnsplashCuratedResponse;
import com.educycle.media.api.dto.response.UnsplashImageResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class UnsplashMediaServiceImpl implements UnsplashMediaService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final UnsplashProperties properties;
    private final UnsplashClient unsplashClient;
    private final Clock clock;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public UnsplashMediaServiceImpl(UnsplashProperties properties, UnsplashClient unsplashClient) {
        this(properties, unsplashClient, Clock.systemUTC());
    }

    public UnsplashMediaServiceImpl(UnsplashProperties properties, UnsplashClient unsplashClient, Clock clock) {
        this.properties = properties;
        this.unsplashClient = unsplashClient;
        this.clock = clock;
    }

    @Override
    public UnsplashCuratedResponse getCurated(String topic, String orientation, int count) {
        String normalizedTopic = normalizeTopic(topic);
        String normalizedOrientation = normalizeOrientation(orientation);
        int normalizedCount = clampCount(count);
        long ttlSeconds = Math.max(60, properties.getCacheTtlSeconds());
        String cacheKey = normalizedTopic + "|" + normalizedOrientation + "|" + normalizedCount;

        CacheEntry cached = cache.get(cacheKey);
        Instant now = Instant.now(clock);
        if (cached != null && !cached.isExpired(now)) {
            return cached.payload();
        }

        if (!properties.isConfigured()) {
            log.warn("Unsplash access key is not configured. Returning empty media payload.");
            UnsplashCuratedResponse empty = emptyResponse(ttlSeconds, now);
            cache.put(cacheKey, new CacheEntry(empty, now.plusSeconds(ttlSeconds)));
            return empty;
        }

        try {
            UnsplashCuratedResponse response = fetchFromUnsplash(
                    normalizedTopic,
                    normalizedOrientation,
                    normalizedCount,
                    ttlSeconds,
                    now
            );
            cache.put(cacheKey, new CacheEntry(response, now.plusSeconds(ttlSeconds)));
            return response;
        } catch (Exception ex) {
            log.warn("Unsplash fetch failed for topic={} orientation={} count={}: {}",
                    normalizedTopic, normalizedOrientation, normalizedCount, ex.getMessage());
            if (cached != null) {
                return cached.payload();
            }
            return emptyResponse(ttlSeconds, now);
        }
    }

    private UnsplashCuratedResponse fetchFromUnsplash(
            String topic,
            String orientation,
            int count,
            long ttlSeconds,
            Instant now
    ) throws Exception {
        String body = unsplashClient.getRandomPhotos(
                topic,
                orientation,
                "high",
                count,
                "Client-ID " + properties.getAccessKey(),
                "v1"
        );

        JsonNode root = MAPPER.readTree(body);
        List<JsonNode> rows = root.isArray() ? toList(root) : List.of(root);
        List<UnsplashImageResponse> items = new ArrayList<>();
        for (JsonNode row : rows) {
            UnsplashImageResponse mapped = mapItem(row);
            if (mapped != null) {
                items.add(mapped);
            }
        }
        return new UnsplashCuratedResponse(Collections.unmodifiableList(items), now, ttlSeconds);
    }

    private static List<JsonNode> toList(JsonNode array) {
        List<JsonNode> out = new ArrayList<>();
        array.forEach(out::add);
        return out;
    }

    private static UnsplashImageResponse mapItem(JsonNode row) {
        if (row == null || row.isMissingNode()) return null;
        JsonNode urls = row.path("urls");
        JsonNode user = row.path("user");
        JsonNode links = row.path("links");
        JsonNode profileLinks = user.path("links");

        String id = row.path("id").asText("");
        if (id.isBlank()) return null;

        return new UnsplashImageResponse(
                id,
                firstNonBlank(row.path("alt_description").asText(""), row.path("description").asText("")),
                row.path("color").asText(""),
                new UnsplashImageResponse.Urls(
                        urls.path("thumb").asText(""),
                        urls.path("small").asText(""),
                        urls.path("regular").asText("")
                ),
                row.path("width").isNumber() ? row.path("width").asInt() : null,
                row.path("height").isNumber() ? row.path("height").asInt() : null,
                new UnsplashImageResponse.Author(
                        user.path("name").asText(""),
                        profileLinks.path("html").asText("")
                ),
                new UnsplashImageResponse.Links(
                        links.path("html").asText(""),
                        links.path("download_location").asText("")
                )
        );
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return "";
    }

    private static String normalizeTopic(String raw) {
        if (raw == null || raw.isBlank()) return "study";
        String topic = raw.trim().toLowerCase(Locale.ROOT);
        return switch (topic) {
            case "books", "study", "campus", "learning" -> topic;
            default -> "study";
        };
    }

    private static String normalizeOrientation(String raw) {
        if (raw == null || raw.isBlank()) return "landscape";
        String value = raw.trim().toLowerCase(Locale.ROOT);
        return "portrait".equals(value) ? "portrait" : "landscape";
    }

    private static int clampCount(int count) {
        return Math.max(1, Math.min(10, count <= 0 ? 6 : count));
    }

    private static UnsplashCuratedResponse emptyResponse(long ttlSeconds, Instant now) {
        return new UnsplashCuratedResponse(List.of(), now, ttlSeconds);
    }

    private record CacheEntry(UnsplashCuratedResponse payload, Instant expiresAt) {
        boolean isExpired(Instant now) {
            return now.isAfter(expiresAt);
        }
    }
}
