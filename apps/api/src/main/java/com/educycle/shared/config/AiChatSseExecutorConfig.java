package com.educycle.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Pool cho SSE AI — tránh {@code new Thread()} không giới hạn mỗi request (Java 17: dùng cached pool + đặt tên thread).
 */
@Configuration
public class AiChatSseExecutorConfig {

    private static final AtomicInteger SEQ = new AtomicInteger();

    @Bean(name = "aiChatSseExecutor", destroyMethod = "shutdown")
    public ExecutorService aiChatSseExecutor() {
        ThreadFactory tf = r -> {
            Thread t = new Thread(r, "ai-sse-" + SEQ.incrementAndGet());
            t.setDaemon(true);
            return t;
        };
        return Executors.newCachedThreadPool(tf);
    }
}
