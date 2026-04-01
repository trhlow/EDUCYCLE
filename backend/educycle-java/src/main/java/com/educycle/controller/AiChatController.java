package com.educycle.controller;

import com.educycle.config.AiChatRateLimiter;
import com.educycle.service.AiChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AI Chatbot endpoint — proxies to Anthropic Claude API.
 * API key stays on the server; never exposed to the browser.
 *
 * POST /api/ai/chat
 * Body: { messages: [{ role: "user"|"assistant", content: "..." }] }
 *
 * Requires authentication (JWT) — prevents abuse by anonymous users.
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;
    private final AiChatRateLimiter aiChatRateLimiter;
    private final ExecutorService aiChatSseExecutor;

    public AiChatController(
            AiChatService aiChatService,
            AiChatRateLimiter aiChatRateLimiter,
            @Qualifier("aiChatSseExecutor") ExecutorService aiChatSseExecutor) {
        this.aiChatService = aiChatService;
        this.aiChatRateLimiter = aiChatRateLimiter;
        this.aiChatSseExecutor = aiChatSseExecutor;
    }

    public record MessageDto(
            @NotBlank String role,
            @NotBlank @Size(max = 4000) String content
    ) {}

    public record ChatRequest(
            @Valid List<MessageDto> messages
    ) {}

    public record ChatResponse(String reply) {}

    /**
     * Authenticated users only.
     * @AuthenticationPrincipal = userId string from JWT.
     */
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ChatRequest request
    ) {
        aiChatRateLimiter.consumeOrThrow(userId);
        log.debug("AI chat request from userId={}, messages={}", userId, request.messages().size());
        String reply = aiChatService.chat(request.messages());
        return ResponseEntity.ok(new ChatResponse(reply));
    }

    /**
     * SSE stream of assistant text chunks. Each event: JSON {@code {"d":"..."}} (delta text).
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody ChatRequest request) {
        aiChatRateLimiter.consumeOrThrow(userId);
        SseEmitter emitter = new SseEmitter(120_000L);
        AtomicBoolean clientClosed = new AtomicBoolean(false);
        emitter.onCompletion(() -> clientClosed.set(true));
        emitter.onTimeout(() -> clientClosed.set(true));
        emitter.onError(e -> clientClosed.set(true));

        aiChatSseExecutor.submit(() -> {
            try {
                aiChatService.streamChat(request.messages(), text -> {
                    if (clientClosed.get()) {
                        return;
                    }
                    try {
                        emitter.send(SseEmitter.event().data(Map.of("d", text), MediaType.APPLICATION_JSON));
                    } catch (IOException ex) {
                        clientClosed.set(true);
                        log.debug("SSE client disconnected: {}", ex.getMessage());
                    }
                });
                emitter.complete();
            } catch (Exception e) {
                log.error("AI SSE failed", e);
                try {
                    emitter.send(SseEmitter.event()
                            .name("error")
                            .data(Map.of("m", "Lỗi stream AI"), MediaType.APPLICATION_JSON));
                } catch (IOException ignored) {
                    // ignore
                }
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
