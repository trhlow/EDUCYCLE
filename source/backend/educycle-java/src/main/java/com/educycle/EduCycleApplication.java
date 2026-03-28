package com.educycle;

import com.educycle.config.CorsProperties;
import com.educycle.config.TransactionExpiryProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({ CorsProperties.class, TransactionExpiryProperties.class })
public class EduCycleApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduCycleApplication.class, args);
    }
}
