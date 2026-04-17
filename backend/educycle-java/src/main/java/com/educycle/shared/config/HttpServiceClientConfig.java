package com.educycle.shared.config;

import com.educycle.media.infrastructure.client.UnsplashClient;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.service.registry.ImportHttpServices;

@Configuration(proxyBeanMethods = false)
@ImportHttpServices(group = "unsplash", types = UnsplashClient.class)
public class HttpServiceClientConfig {
}
