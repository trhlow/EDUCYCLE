package com.educycle.transaction.application;

import com.educycle.notification.application.service.NotificationService;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.transaction.api.dto.request.SendMessageRequest;
import com.educycle.transaction.application.service.impl.MessageServiceImpl;
import com.educycle.transaction.application.support.TransactionAccessService;
import com.educycle.transaction.domain.Message;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.infrastructure.persistence.MessageRepository;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService authorization")
class MessageServiceImplTest {

    @Mock private MessageRepository messageRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    private MessageServiceImpl service;
    private User buyer;
    private User seller;
    private User outsider;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        buyer = user("buyer");
        seller = user("seller");
        outsider = user("outsider");
        transaction = Transaction.builder()
                .id(UUID.randomUUID())
                .buyer(buyer)
                .seller(seller)
                .amount(new BigDecimal("10.00"))
                .createdAt(Instant.now())
                .build();
        service = new MessageServiceImpl(
                messageRepository,
                transactionRepository,
                userRepository,
                notificationService,
                new TransactionAccessService());
    }

    @Test
    @DisplayName("outsider cannot read transaction messages")
    void outsiderCannotReadMessages() {
        given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

        assertThatThrownBy(() -> service.getByTransactionId(transaction.getId(), outsider.getId(), false))
                .isInstanceOf(ForbiddenException.class);

        verify(messageRepository, never()).findByTransactionId(any());
    }

    @Test
    @DisplayName("outsider cannot send a message or trigger notification")
    void outsiderCannotSendMessage() {
        given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));

        assertThatThrownBy(() -> service.send(transaction.getId(), new SendMessageRequest("hello"), outsider.getId()))
                .isInstanceOf(ForbiddenException.class);

        verify(userRepository, never()).findById(any());
        verify(messageRepository, never()).save(any());
        verify(notificationService, never()).create(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("participant can read transaction messages")
    void participantCanReadMessages() {
        Message message = Message.builder()
                .id(UUID.randomUUID())
                .transaction(transaction)
                .sender(buyer)
                .content("hello")
                .createdAt(Instant.now())
                .build();
        given(transactionRepository.findByIdWithDetails(transaction.getId())).willReturn(Optional.of(transaction));
        given(messageRepository.findByTransactionId(transaction.getId())).willReturn(List.of(message));

        assertThat(service.getByTransactionId(transaction.getId(), buyer.getId(), false)).hasSize(1);
    }

    private static User user(String username) {
        return User.builder()
                .id(UUID.randomUUID())
                .username(username)
                .email(username + "@test.local")
                .passwordHash("hash")
                .role(Role.USER)
                .build();
    }
}
