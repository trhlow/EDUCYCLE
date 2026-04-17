package com.educycle.transaction.api;

import com.educycle.transaction.dto.message.ChatMessage;
import com.educycle.transaction.dto.message.MessageResponse;
import com.educycle.transaction.dto.message.SendMessageRequest;
import com.educycle.transaction.application.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

/**
 * STOMP controller for real-time chat.
 * Client sends to /app/chat.send → broadcast to /topic/transaction.{txId}.
 * Messages are persisted via MessageService (same as HTTP endpoint).
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message, Principal principal) {
        if (principal == null) {
            log.warn("WebSocket message without authenticated principal");
            return;
        }

        UUID senderId = UUID.fromString(principal.getName());
        UUID txId = UUID.fromString(message.transactionId());

        SendMessageRequest req = new SendMessageRequest(message.content());
        MessageResponse saved = messageService.send(txId, req, senderId);

        messagingTemplate.convertAndSend(
                "/topic/transaction." + message.transactionId(),
                saved
        );
    }
}
