package com.educycle;

import com.educycle.shared.config.CorsProperties;
import com.educycle.shared.config.RegistrationOtpProperties;
import com.educycle.shared.config.TransactionExpiryProperties;
import com.educycle.shared.config.TransactionOtpProperties;
import com.educycle.shared.config.UnsplashProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(
        basePackages = {
                "com.educycle.shared",
                "com.educycle.auth",
                "com.educycle.user",
                "com.educycle.listing",
                "com.educycle.transaction",
                "com.educycle.review",
                "com.educycle.admin",
                "com.educycle.media",
                "com.educycle.notification.application"
        },
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = {
                        "com\\.educycle\\.shared\\.config\\.(Ai.*|InMemoryAiChatRateLimiter|RedisAiChatRateLimiter|WebSocketConfig)",
                        "com\\.educycle\\.shared\\.security\\.WebSocketAuthInterceptor",
                        "com\\.educycle\\.transaction\\.api\\.ChatController"
                }
        )
)
@EntityScan(basePackages = {
        "com.educycle.user.domain",
        "com.educycle.listing.domain",
        "com.educycle.transaction.domain",
        "com.educycle.review.domain",
        "com.educycle.notification.domain"
})
@EnableJpaRepositories(basePackages = {
        "com.educycle.user.infrastructure.persistence",
        "com.educycle.listing.infrastructure.persistence",
        "com.educycle.transaction.infrastructure.persistence",
        "com.educycle.review.infrastructure.persistence",
        "com.educycle.notification.infrastructure.persistence"
})
@EnableScheduling
@EnableConfigurationProperties({
        CorsProperties.class,
        TransactionExpiryProperties.class,
        UnsplashProperties.class,
        TransactionOtpProperties.class,
        RegistrationOtpProperties.class
})
public class EduCycleApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduCycleApplication.class, args);
    }
}
