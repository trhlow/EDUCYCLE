package com.educycle.transaction.application;

import com.educycle.shared.config.TransactionExpiryProperties;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.user.domain.Role;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.listing.domain.Product;
import com.educycle.transaction.domain.Transaction;
import com.educycle.user.domain.User;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.transaction.application.service.impl.TransactionExpiryServiceImpl;
import com.educycle.shared.util.MessageConstants;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionExpiryService")
class TransactionExpiryServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private NotificationService notificationService;

    private final TransactionExpiryProperties expiryProperties = new TransactionExpiryProperties();
    private final SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();

    private TransactionExpiryServiceImpl transactionExpiryService;

    private User buyer;
    private User seller;
    private Product product;

    @BeforeEach
    void setUp() {
        buyer = User.builder()
                .id(UUID.randomUUID())
                .username("buyer")
                .email("buyer@student.edu.vn")
                .passwordHash("x")
                .role(Role.USER)
                .emailVerified(true)
                .phoneVerified(false)
                .build();
        seller = User.builder()
                .id(UUID.randomUUID())
                .username("seller")
                .email("seller@student.edu.vn")
                .passwordHash("x")
                .role(Role.USER)
                .emailVerified(true)
                .phoneVerified(false)
                .build();
        product = Product.builder()
                .id(UUID.randomUUID())
                .name("Book")
                .price(new BigDecimal("10"))
                .user(seller)
                .status(ProductStatus.APPROVED)
                .createdAt(Instant.now())
                .build();

        expiryProperties.setPendingStaleHours(48);
        expiryProperties.setAcceptedStaleHours(168);

        transactionExpiryService = new TransactionExpiryServiceImpl(
                transactionRepository, notificationService, expiryProperties, meterRegistry);
    }

    @Test
    @DisplayName("expired PENDING transactions are cancelled with system reason")
    void shouldExpirePending() {
        Instant old = Instant.now().minus(72, ChronoUnit.HOURS);
        Transaction t = Transaction.builder()
                .id(UUID.randomUUID())
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .amount(new BigDecimal("10"))
                .status(TransactionStatus.PENDING)
                .buyerConfirmed(false)
                .sellerConfirmed(false)
                .createdAt(old)
                .build();

        given(transactionRepository.findByStatusAndCreatedAtBefore(eq(TransactionStatus.PENDING), any(Instant.class)))
                .willReturn(List.of(t));
        given(transactionRepository.findByStatusInAndUpdatedAtBefore(any(), any(Instant.class)))
                .willReturn(List.of());

        transactionExpiryService.expireStaleTransactions();

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(TransactionStatus.CANCELLED);
        assertThat(captor.getValue().getCancelReason()).isEqualTo(MessageConstants.TRANSACTION_EXPIRED_PENDING_SYSTEM);

        verify(notificationService, times(2)).create(any(), eq("TRANSACTION_EXPIRED"), any(), any(), eq(t.getId()));
        assertThat(meterRegistry.counter("educycle.transactions.expired", "kind", "pending").count()).isEqualTo(1.0);
    }

    @Test
    @DisplayName("expired ACCEPTED transactions are cancelled")
    void shouldExpireAccepted() {
        Instant old = Instant.now().minus(200, ChronoUnit.HOURS);
        Transaction t = Transaction.builder()
                .id(UUID.randomUUID())
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .amount(new BigDecimal("10"))
                .status(TransactionStatus.ACCEPTED)
                .buyerConfirmed(false)
                .sellerConfirmed(false)
                .createdAt(old.minus(1, ChronoUnit.HOURS))
                .updatedAt(old)
                .build();

        given(transactionRepository.findByStatusAndCreatedAtBefore(eq(TransactionStatus.PENDING), any(Instant.class)))
                .willReturn(List.of());
        given(transactionRepository.findByStatusInAndUpdatedAtBefore(any(), any(Instant.class)))
                .willReturn(List.of(t));

        transactionExpiryService.expireStaleTransactions();

        verify(transactionRepository).save(any(Transaction.class));
        assertThat(meterRegistry.counter("educycle.transactions.expired", "kind", "accepted").count()).isEqualTo(1.0);
    }
}
