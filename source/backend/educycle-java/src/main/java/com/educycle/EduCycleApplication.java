package com.educycle;

import com.educycle.config.CorsProperties;
import com.educycle.config.OAuthProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ CorsProperties.class, OAuthProperties.class })
public class EduCycleApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduCycleApplication.class, args);
    }
}
