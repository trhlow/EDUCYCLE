package com.educycle.transaction.api;

import com.educycle.shared.exception.ForbiddenException;
import com.educycle.transaction.api.dto.request.ChatMessage;
import com.educycle.transaction.api.dto.request.SendMessageRequest;
import com.educycle.transaction.application.service.MessageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.security.Principal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock private MessageService messageService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @Test
    @DisplayName("WebSocket outsider is blocked before broadcast")
    void websocketOutsiderIsBlockedBeforeBroadcast() {
        ChatController controller = new ChatController(messageService, messagingTemplate);
        UUID transactionId = UUID.randomUUID();
        UUID outsiderId = UUID.randomUUID();
        given(messageService.send(eq(transactionId), any(SendMessageRequest.class), eq(outsiderId)))
                .willThrow(new ForbiddenException("Forbidden"));

        Principal principal = outsiderId::toString;
        controller.sendMessage(new ChatMessage(transactionId.toString(), "hello"), principal);

        verify(messagingTemplate, never()).convertAndSend(any(String.class), any(Object.class));
    }
}
