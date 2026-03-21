package com.educycle.service;

import com.educycle.dto.transaction.CreateTransactionRequest;
import com.educycle.dto.transaction.TransactionResponse;
import com.educycle.dto.transaction.UpdateTransactionStatusRequest;
import com.educycle.enums.ProductStatus;
import com.educycle.enums.Role;
import com.educycle.enums.TransactionStatus;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.NotFoundException;
import com.educycle.model.Product;
import com.educycle.model.Transaction;
import com.educycle.model.User;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.impl.TransactionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Tests")
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private ProductRepository     productRepository;
    @Mock private UserRepository        userRepository;
    @Mock private NotificationService   notificationService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User buyer, seller;
    private Product product;

    @BeforeEach
    void setUp() {
        buyer = buildUser(UUID.randomUUID(), "buyer@test.com");
        seller = buildUser(UUID.randomUUID(), "seller@test.com");
        product = buildProduct(UUID.randomUUID(), seller);
    }

    @Nested
    @DisplayName("create()")
    class Create {

        @Test
        @DisplayName("should create transaction and return response")
        void shouldCreateTransaction() {
            CreateTransactionRequest req = new CreateTransactionRequest(
                    product.getId(), seller.getId(), new BigDecimal("50.00"));

            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(userRepository.findById(seller.getId())).willReturn(Optional.of(seller));
            given(productRepository.findByIdWithUser(product.getId())).willReturn(Optional.of(product));

            TransactionResponse result = transactionService.create(req, buyer.getId());

            assertThat(result).isNotNull();
            assertThat(result.status()).isEqualTo("PENDING");
            assertThat(result.amount()).isEqualByComparingTo("50.00");
            verify(transactionRepository, times(1)).save(any(Transaction.class));
        }

        @Test
        @DisplayName("should throw NotFoundException when buyer not found")
        void shouldThrow_whenBuyerNotFound() {
            CreateTransactionRequest req = new CreateTransactionRequest(
                    product.getId(), seller.getId(), new BigDecimal("50.00"));

            given(userRepository.findById(buyer.getId())).willReturn(Optional.empty());

            assertThatThrownBy(() -> transactionService.create(req, buyer.getId()))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Buyer not found");
        }
    }

    @Nested
    @DisplayName("verifyOtp()")
    class VerifyOtp {

        @Test
        @DisplayName("should complete transaction when OTP is valid")
        void shouldComplete_whenOtpValid() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            t.setOtpCode("123456");
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));
            given(productRepository.findById(product.getId())).willReturn(Optional.of(product));

            transactionService.verifyOtp(t.getId(), "123456");

            assertThat(t.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
            assertThat(t.getOtpCode()).isNull();
            verify(productRepository, times(1)).save(product);
        }

        @Test
        @DisplayName("should throw BadRequestException when OTP is wrong")
        void shouldThrow_whenOtpWrong() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            t.setOtpCode("123456");
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.verifyOtp(t.getId(), "999999"))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }

        @Test
        @DisplayName("should throw BadRequestException when OTP is expired")
        void shouldThrow_whenOtpExpired() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            t.setOtpCode("123456");
            t.setOtpExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES)); // expired

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.verifyOtp(t.getId(), "123456"))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid or expired OTP");
        }
    }

    @Nested
    @DisplayName("generateOtp()")
    class GenerateOtp {

        @Test
        @DisplayName("should generate 6-digit OTP and return it")
        void shouldGenerateOtp() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            Map<String, String> result = transactionService.generateOtp(t.getId());

            assertThat(result).containsKey("otp");
            assertThat(result.get("otp")).hasSize(6).containsOnlyDigits();
            assertThat(t.getOtpCode()).isNotNull();
            assertThat(t.getOtpExpiresAt()).isAfter(Instant.now());
        }
    }

    @Nested
    @DisplayName("updateStatus()")
    class UpdateStatus {

        @Test
        @DisplayName("should update status when valid enum value given")
        void shouldUpdateStatus_whenValid() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            TransactionResponse result = transactionService.updateStatus(
                    t.getId(), new UpdateTransactionStatusRequest("ACCEPTED"));

            assertThat(result.status()).isEqualTo("ACCEPTED");
        }

        @Test
        @DisplayName("should throw BadRequestException for invalid status string")
        void shouldThrow_whenInvalidStatus() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.updateStatus(
                    t.getId(), new UpdateTransactionStatusRequest("INVALID_STATUS")))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Invalid transaction status");
        }
    }

    // ===== Helpers =====

    private User buildUser(UUID id, String email) {
        return User.builder()
                .id(id).username(email.split("@")[0]).email(email)
                .passwordHash("hash").role(Role.USER)
                .emailVerified(false).phoneVerified(false)
                .build();
    }

    private Product buildProduct(UUID id, User owner) {
        return Product.builder()
                .id(id).name("Test Product").price(new BigDecimal("50.00"))
                .user(owner).status(ProductStatus.APPROVED)
                .createdAt(Instant.now())
                .build();
    }

    private Transaction buildTransaction(TransactionStatus status) {
        return Transaction.builder()
                .id(UUID.randomUUID())
                .buyer(buyer).seller(seller).product(product)
                .amount(new BigDecimal("50.00"))
                .status(status)
                .buyerConfirmed(false).sellerConfirmed(false)
                .createdAt(Instant.now())
                .build();
    }
}
