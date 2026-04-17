package com.educycle.media.application.service;

import com.educycle.media.api.dto.response.UnsplashCuratedResponse;

public interface UnsplashMediaService {
    UnsplashCuratedResponse getCurated(String topic, String orientation, int count);
}
