package com.educycle.service;

import com.educycle.dto.media.UnsplashCuratedResponse;

public interface UnsplashMediaService {
    UnsplashCuratedResponse getCurated(String topic, String orientation, int count);
}
