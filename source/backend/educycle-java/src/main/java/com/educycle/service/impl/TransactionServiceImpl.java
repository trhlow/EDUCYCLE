package com.educycle.service.impl;

import com.educycle.dto.transaction.CreateTransactionRequest;
import com.educycle.dto.transaction.TransactionResponse;
import com.educycle.dto.transaction.UpdateTransactionStatusRequest;
import com.educycle.enums.ProductStatus;
import com.educycle.enums.TransactionStatus;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.NotFoundException;
import com.educycle.model.Product;
import com.educycle.model.Transaction;
import com.educycle.model.User;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.TransactionService;
import com.educycle.util.OtpHasher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Maps C# TransactionService.cs
 *
 * Key differences:
 *  - Random.Shared.Next(100000, 999999) → SecureRandom (cryptographically safe)
 *  - Enum.Parse<TransactionStatus>()    → TransactionStatus.valueOf()
 *  - DateTime.UtcNow.AddMinutes(10)     → Instant.now().plus(10, ChronoUnit.MINUTES)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository     productRepository;
    private final UserRepository        userRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ===== CREATE =====

    @Override
    public TransactionResponse create(CreateTransactionRequest request, UUID buyerId) {
        // Buyer cannot be the same as seller
        if (buyerId.equals(request.sellerId())) {
            throw new BadRequestException("Buyer cannot be the same as seller");
        }

        User buyer  = userRepository.findById(buyerId)
                .orElseThrow(() -> new NotFoundException("Buyer not found"));
        User seller = userRepository.findById(request.sellerId())
                .orElseThrow(() -> new NotFoundException("Seller not found"));
        Product product = productRepository.findByIdWithUser(request.productId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Product must be APPROVED to create a transaction
        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException("Product is not available for transaction (status: " + product.getStatus() + ")");
        }

        Transaction transaction = Transaction.builder()
                .product(product)
                .buyer(buyer)
                .seller(seller)
                .amount(request.amount())
                .status(TransactionStatus.PENDING)
                .buyerConfirmed(false)
                .sellerConfirmed(false)
                .build();

        transactionRepository.save(transaction);
        log.info("Transaction created: {} buyer={} seller={}", transaction.getId(), buyerId, request.sellerId());
        return mapToResponse(transaction);
    }

    // ===== GET BY ID =====

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(UUID id) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Transaction with id '" + id + "' not found"));
        return mapToResponse(t);
    }

    // ===== GET ALL =====

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAll() {
        return transactionRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ===== GET MY TRANSACTIONS =====

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getMyTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ===== UPDATE STATUS =====

    @Override
    public TransactionResponse updateStatus(UUID id, UpdateTransactionStatusRequest request) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Transaction with id '" + id + "' not found"));

        try {
            t.setStatus(TransactionStatus.valueOf(request.status().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid transaction status: " + request.status());
        }

        transactionRepository.save(t);
        return mapToResponse(t);
    }

    // ===== GENERATE OTP =====

    @Override
    public Map<String, String> generateOtp(UUID id) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Transaction with id '" + id + "' not found"));

        // 6-digit OTP — SecureRandom for cryptographic safety
        String otp = String.format("%06d", 100000 + SECURE_RANDOM.nextInt(900000));
        t.setOtpCode(OtpHasher.hash(otp));  // store SHA-256 hash, not plaintext
        t.setOtpExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        transactionRepository.save(t);

        log.info("OTP generated for transaction {}", id);
        return Map.of("otp", otp);  // return plaintext to user only
    }

    // ===== VERIFY OTP =====

    @Override
    public void verifyOtp(UUID id, String otp) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Transaction with id '" + id + "' not found"));

        if (t.getOtpCode() == null
                || !OtpHasher.verify(otp, t.getOtpCode())
                || t.getOtpExpiresAt() == null
                || t.getOtpExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        t.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(t);

        markProductAsSold(t.getProduct().getId());
    }

    // ===== CONFIRM RECEIPT =====

    @Override
    public TransactionResponse confirmReceipt(UUID id) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException("Transaction with id '" + id + "' not found"));

        t.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(t);

        markProductAsSold(t.getProduct().getId());
        return mapToResponse(t);
    }

    // ===== Private Helpers =====

    private void markProductAsSold(UUID productId) {
        productRepository.findById(productId).ifPresent(p -> {
            p.setStatus(ProductStatus.SOLD);
            productRepository.save(p);
            log.info("Product {} marked as SOLD", productId);
        });
    }

    private TransactionResponse mapToResponse(Transaction t) {
        TransactionResponse.TransactionUserDto buyer = t.getBuyer() != null
                ? new TransactionResponse.TransactionUserDto(
                        t.getBuyer().getId().toString(),
                        t.getBuyer().getUsername(),
                        t.getBuyer().getEmail())
                : null;

        TransactionResponse.TransactionUserDto seller = t.getSeller() != null
                ? new TransactionResponse.TransactionUserDto(
                        t.getSeller().getId().toString(),
                        t.getSeller().getUsername(),
                        t.getSeller().getEmail())
                : null;

        TransactionResponse.TransactionProductDto product = t.getProduct() != null
                ? new TransactionResponse.TransactionProductDto(
                        t.getProduct().getId().toString(),
                        t.getProduct().getName(),
                        t.getProduct().getPrice(),
                        t.getProduct().getImageUrl())
                : null;

        return new TransactionResponse(
                t.getId(),
                buyer,
                seller,
                product,
                t.getAmount(),
                t.getStatus().name(),
                t.isBuyerConfirmed(),
                t.isSellerConfirmed(),
                t.getCreatedAt()
        );
    }
}
