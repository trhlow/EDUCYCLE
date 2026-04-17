package com.educycle.media.infrastructure.client;

import com.educycle.shared.config.UnsplashProperties;
import com.educycle.media.api.dto.response.UnsplashCuratedResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("UnsplashMediaServiceImpl Tests")
class UnsplashMediaServiceImplTest {

    @Test
    @DisplayName("should map unsplash payload and reuse cache within ttl")
    void shouldMapAndCache() throws Exception {
        UnsplashProperties props = new UnsplashProperties();
        props.setAccessKey("test-key");
        props.setCacheTtlSeconds(21600);

        UnsplashClient unsplashClient = mock(UnsplashClient.class);
        when(unsplashClient.getRandomPhotos(any(), any(), any(), anyInt(), any(), any())).thenReturn("""
                [
                  {
                    "id": "abc123",
                    "alt_description": "students reading books",
                    "color": "#AABBCC",
                    "width": 3000,
                    "height": 2000,
                    "urls": {
                      "thumb": "https://img/thumb",
                      "small": "https://img/small",
                      "regular": "https://img/regular"
                    },
                    "user": {
                      "name": "Jane Doe",
                      "links": { "html": "https://unsplash.com/@jane" }
                    },
                    "links": {
                      "html": "https://unsplash.com/photos/abc123",
                      "download_location": "https://api.unsplash.com/photos/abc123/download"
                    }
                  }
                ]
                """);

        Clock fixedClock = Clock.fixed(Instant.parse("2026-04-04T08:00:00Z"), ZoneOffset.UTC);
        UnsplashMediaServiceImpl service = new UnsplashMediaServiceImpl(props, unsplashClient, fixedClock);

        UnsplashCuratedResponse first = service.getCurated("study", "landscape", 1);
        UnsplashCuratedResponse second = service.getCurated("study", "landscape", 1);

        assertThat(first.items()).hasSize(1);
        assertThat(first.items().get(0).id()).isEqualTo("abc123");
        assertThat(first.items().get(0).author().name()).isEqualTo("Jane Doe");
        assertThat(first.items().get(0).links().downloadLocation()).contains("/download");
        assertThat(second.items()).hasSize(1);
        verify(unsplashClient, times(1)).getRandomPhotos(any(), any(), any(), anyInt(), any(), any());
    }

    @Test
    @DisplayName("should return empty payload when unsplash key is missing")
    void shouldReturnEmptyWhenKeyMissing() {
        UnsplashProperties props = new UnsplashProperties();
        props.setAccessKey("");

        UnsplashClient unsplashClient = mock(UnsplashClient.class);
        UnsplashMediaServiceImpl service = new UnsplashMediaServiceImpl(
                props,
                unsplashClient,
                Clock.fixed(Instant.parse("2026-04-04T08:00:00Z"), ZoneOffset.UTC)
        );

        UnsplashCuratedResponse response = service.getCurated("books", "landscape", 3);
        assertThat(response.items()).isEmpty();
        verifyNoInteractions(unsplashClient);
    }
}
