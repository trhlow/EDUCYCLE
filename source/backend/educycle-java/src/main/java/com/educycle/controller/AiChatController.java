package com.educycle.controller;

import com.educycle.config.AiChatRateLimiter;
import com.educycle.service.AiChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;
    private final AiChatRateLimiter aiChatRateLimiter;

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
}
