package com.educycle.media.infrastructure.client;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange
public interface UnsplashClient {

    @GetExchange("/photos/random")
    String getRandomPhotos(
            @RequestParam String query,
            @RequestParam String orientation,
            @RequestParam("content_filter") String contentFilter,
            @RequestParam int count,
            @RequestHeader("Authorization") String authorization,
            @RequestHeader("Accept-Version") String acceptVersion
    );
}
