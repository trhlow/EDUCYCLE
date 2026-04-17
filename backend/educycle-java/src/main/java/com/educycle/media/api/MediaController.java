package com.educycle.media.api;

import com.educycle.media.dto.UnsplashCuratedResponse;
import com.educycle.media.application.UnsplashMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final UnsplashMediaService unsplashMediaService;

    @GetMapping("/unsplash/curated")
    public ResponseEntity<UnsplashCuratedResponse> getUnsplashCurated(
            @RequestParam(defaultValue = "study") String topic,
            @RequestParam(defaultValue = "landscape") String orientation,
            @RequestParam(defaultValue = "6") int count
    ) {
        return ResponseEntity.ok(unsplashMediaService.getCurated(topic, orientation, count));
    }
}
