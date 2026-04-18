package com.educycle.transaction.application;

import com.educycle.transaction.api.dto.request.CreateTransactionRequest;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.api.dto.request.UpdateTransactionStatusRequest;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.user.domain.Role;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.listing.domain.Product;
import com.educycle.transaction.domain.Transaction;
import com.educycle.user.domain.User;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.shared.config.JwtProperties;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.infrastructure.persistence.UserRepository;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.transaction.application.support.ProductSoldMarker;
import com.educycle.transaction.application.support.TransactionResponseMapper;
import com.educycle.transaction.application.service.impl.TransactionServiceImpl;
import com.educycle.transaction.application.usecase.CreateTransactionUseCase;
import com.educycle.transaction.application.usecase.TransactionDisputeUseCase;
import com.educycle.transaction.application.usecase.TransactionOtpUseCase;
import com.educycle.transaction.application.usecase.TransactionQueryUseCase;
import com.educycle.transaction.application.usecase.TransactionStatusUseCase;
import com.educycle.shared.util.OtpHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Tests")
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private ProductRepository     productRepository;
    @Mock private UserRepository        userRepository;
    @Mock private NotificationService   notificationService;

    private OtpHasher otpHasher;
    private TransactionServiceImpl transactionService;

    private User buyer, seller;
    private Product product;

    @BeforeEach
    void setUp() {
        buyer = buildUser(UUID.randomUUID(), "buyer@test.com");
        seller = buildUser(UUID.randomUUID(), "seller@test.com");
        product = buildProduct(UUID.randomUUID(), seller);
        JwtProperties jwtProperties = new JwtProperties();
        jwtProperties.setSecret("test-jwt-secret-at-least-32-characters-long!");
        otpHasher = new OtpHasher("", jwtProperties);
        TransactionResponseMapper mapper = new TransactionResponseMapper();
        ProductSoldMarker productSoldMarker = new ProductSoldMarker(productRepository);
        transactionService = new TransactionServiceImpl(
                new CreateTransactionUseCase(transactionRepository, productRepository, userRepository, notificationService, mapper),
                new TransactionQueryUseCase(transactionRepository, mapper),
                new TransactionStatusUseCase(transactionRepository, notificationService, productSoldMarker, mapper),
                new TransactionOtpUseCase(transactionRepository, productSoldMarker, otpHasher),
                new TransactionDisputeUseCase(transactionRepository, notificationService, productSoldMarker, mapper));
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
            given(productRepository.findByIdWithUserForUpdate(product.getId())).willReturn(Optional.of(product));
            given(transactionRepository.existsByProduct_IdAndStatusIn(eq(product.getId()), any()))
                    .willReturn(false);

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
                    .hasMessageContaining("Không tìm thấy người mua");
        }

        @Test
        @DisplayName("should throw when product already has an active transaction")
        void shouldThrow_whenProductHasActiveTransaction() {
            CreateTransactionRequest req = new CreateTransactionRequest(
                    product.getId(), seller.getId(), new BigDecimal("50.00"));

            given(userRepository.findById(buyer.getId())).willReturn(Optional.of(buyer));
            given(userRepository.findById(seller.getId())).willReturn(Optional.of(seller));
            given(productRepository.findByIdWithUserForUpdate(product.getId())).willReturn(Optional.of(product));
            given(transactionRepository.existsByProduct_IdAndStatusIn(eq(product.getId()), any()))
                    .willReturn(true);

            assertThatThrownBy(() -> transactionService.create(req, buyer.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("đang có giao dịch");
        }
    }

    @Nested
    @DisplayName("verifyOtp()")
    class VerifyOtp {

        @Test
        @DisplayName("should complete transaction when OTP is valid")
        void shouldComplete_whenOtpValid() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            t.setOtpCode(otpHasher.hash("123456"));
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));
            given(productRepository.findById(product.getId())).willReturn(Optional.of(product));

            transactionService.verifyOtp(t.getId(), "123456", seller.getId());

            assertThat(t.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
            assertThat(t.getOtpCode()).isNull();
            verify(productRepository, times(1)).save(product);
        }

        @Test
        @DisplayName("should throw BadRequestException when OTP is wrong")
        void shouldThrow_whenOtpWrong() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            t.setOtpCode(otpHasher.hash("123456"));
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.verifyOtp(t.getId(), "999999", seller.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        @Test
        @DisplayName("should throw BadRequestException when OTP is expired")
        void shouldThrow_whenOtpExpired() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            t.setOtpCode(otpHasher.hash("123456"));
            t.setOtpExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES)); // expired

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.verifyOtp(t.getId(), "123456", seller.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        @Test
        @DisplayName("should throw ForbiddenException when caller is not seller")
        void shouldThrow_whenNotSeller() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            t.setOtpCode(otpHasher.hash("123456"));
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));

            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.verifyOtp(t.getId(), "123456", buyer.getId()))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Chỉ người bán");
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

            Map<String, String> result = transactionService.generateOtp(t.getId(), buyer.getId());

            assertThat(result).containsKey("otp");
            assertThat(result.get("otp")).hasSize(6).containsOnlyDigits();
            assertThat(t.getOtpCode()).isNotNull();
            assertThat(t.getOtpExpiresAt()).isAfter(Instant.now());
        }

        @Test
        @DisplayName("should throw ForbiddenException when caller is not buyer")
        void shouldThrow_whenNotBuyer() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.generateOtp(t.getId(), seller.getId()))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Chỉ người mua");
        }

        @Test
        @DisplayName("should throw BadRequestException when OTP already active and not expired")
        void shouldThrow_whenOtpAlreadyActive() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            t.setOtpCode(otpHasher.hash("111111"));
            t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.generateOtp(t.getId(), buyer.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Mã OTP cho giao dịch này đã được tạo");
        }
    }

    @Nested
    @DisplayName("confirmReceipt()")
    class ConfirmReceipt {

        @Test
        @DisplayName("should complete when buyer confirms in ACCEPTED")
        void shouldComplete_whenBuyer() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));
            given(productRepository.findById(product.getId())).willReturn(Optional.of(product));

            TransactionResponse res = transactionService.confirmReceipt(t.getId(), buyer.getId());

            assertThat(res.status()).isEqualTo("COMPLETED");
            assertThat(t.isBuyerConfirmed()).isTrue();
            verify(productRepository, times(1)).save(product);
        }

        @Test
        @DisplayName("should throw ForbiddenException when caller is not buyer")
        void shouldThrow_whenNotBuyer() {
            Transaction t = buildTransaction(TransactionStatus.ACCEPTED);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.confirmReceipt(t.getId(), seller.getId()))
                    .isInstanceOf(ForbiddenException.class)
                    .hasMessageContaining("Chỉ người mua");
        }

        @Test
        @DisplayName("should throw BadRequestException when status is PENDING")
        void shouldThrow_whenWrongStatus() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.confirmReceipt(t.getId(), buyer.getId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("xác nhận nhận hàng");
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
                    t.getId(), seller.getId(), new UpdateTransactionStatusRequest("ACCEPTED"));

            assertThat(result.status()).isEqualTo("ACCEPTED");
        }

        @Test
        @DisplayName("should throw BadRequestException for invalid status string")
        void shouldThrow_whenInvalidStatus() {
            Transaction t = buildTransaction(TransactionStatus.PENDING);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.updateStatus(
                    t.getId(), buyer.getId(), new UpdateTransactionStatusRequest("INVALID_STATUS")))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Trạng thái giao dịch không hợp lệ");
        }

        @Test
        @DisplayName("should reject setting DISPUTED via generic status API")
        void shouldThrow_whenDisputedViaPatch() {
            Transaction t = buildTransaction(TransactionStatus.MEETING);
            given(transactionRepository.findByIdWithDetails(t.getId())).willReturn(Optional.of(t));

            assertThatThrownBy(() -> transactionService.updateStatus(
                    t.getId(), buyer.getId(), new UpdateTransactionStatusRequest("DISPUTED")))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("DISPUTED");
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
