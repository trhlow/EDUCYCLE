package com.educycle.transaction.api;

import com.educycle.transaction.api.dto.request.ChatMessage;
import com.educycle.transaction.api.dto.response.MessageResponse;
import com.educycle.transaction.api.dto.request.SendMessageRequest;
import com.educycle.transaction.application.service.MessageService;
import com.educycle.shared.exception.ForbiddenException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP controller for real-time chat.
 * Client sends to /app/chat.send → broadcast to /topic/transaction.{txId}.
 * Messages are persisted via MessageService (same as HTTP endpoint).
 */
@Slf4j
@Controller
@Validated
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Valid ChatMessage message, Principal principal) {
        if (principal == null) {
            log.warn("WebSocket message without authenticated principal");
            return;
        }

        UUID senderId = UUID.fromString(principal.getName());
        UUID txId = UUID.fromString(message.transactionId());

        SendMessageRequest req = new SendMessageRequest(message.content());
        MessageResponse saved;
        try {
            saved = messageService.send(txId, req, senderId);
        } catch (ForbiddenException ex) {
            log.warn("Blocked unauthorized WebSocket message for transaction {} from user {}", txId, senderId);
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/transaction." + message.transactionId(),
                saved
        );
    }
}
