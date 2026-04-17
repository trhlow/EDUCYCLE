package com.educycle.media.application;

import com.educycle.media.dto.UnsplashCuratedResponse;

public interface UnsplashMediaService {
    UnsplashCuratedResponse getCurated(String topic, String orientation, int count);
}
