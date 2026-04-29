package com.educycle.transaction.application.usecase;

import com.educycle.shared.config.TransactionOtpProperties;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.shared.util.OtpHasher;
import com.educycle.transaction.application.support.ProductSoldMarker;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionOtpUseCase {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final TransactionRepository transactionRepository;
    private final ProductSoldMarker productSoldMarker;
    private final OtpHasher otpHasher;
    private final TransactionOtpProperties otpProperties;

    public Map<String, String> generateOtp(UUID id, UUID actorUserId) {
        Transaction transaction = load(id);

        if (transaction.getBuyer() == null || !transaction.getBuyer().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.OTP_GENERATE_BUYER_ONLY);
        }
        requireAccepted(transaction);
        Instant lockUntil = transaction.getOtpLockedUntil();
        if (lockUntil != null) {
            if (lockUntil.isAfter(Instant.now())) {
                throw new BadRequestException(MessageConstants.TRANSACTION_OTP_LOCKED);
            }
            transaction.setOtpLockedUntil(null);
            transaction.setOtpFailedAttempts(0);
        }

        String otp = String.format("%06d", 100000 + SECURE_RANDOM.nextInt(900000));
        transaction.setOtpCode(otpHasher.hash(otp));
        transaction.setOtpExpiresAt(
                Instant.now().plus(Math.max(1, otpProperties.getExpiryMinutes()), ChronoUnit.MINUTES));
        transaction.setOtpFailedAttempts(0);
        transaction.setOtpLockedUntil(null);
        transactionRepository.save(transaction);

        log.info("OTP generated for transaction {}", id);
        return Map.of("otp", otp);
    }

    public void verifyOtp(UUID id, String otp, UUID actorUserId) {
        Transaction transaction = load(id);

        if (transaction.getSeller() == null || !transaction.getSeller().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.OTP_VERIFY_SELLER_ONLY);
        }
        TransactionStatus st = transaction.getStatus();
        if (st == TransactionStatus.COMPLETED || st == TransactionStatus.AUTO_COMPLETED) {
            return;
        }
        if (isLockedForVerify(transaction)) {
            throw new BadRequestException(MessageConstants.TRANSACTION_OTP_LOCKED);
        }
        requireAccepted(transaction);

        boolean otpValid = transaction.getOtpCode() != null
                && transaction.getOtpExpiresAt() != null
                && transaction.getOtpExpiresAt().isAfter(Instant.now())
                && otpHasher.verify(otp, transaction.getOtpCode());

        if (!otpValid) {
            int fails = transaction.getOtpFailedAttempts() + 1;
            transaction.setOtpFailedAttempts(fails);
            int maxFails = Math.max(1, otpProperties.getMaxFailedAttempts());
            if (fails >= maxFails) {
                transaction.setOtpLockedUntil(
                        Instant.now().plus(Math.max(1, otpProperties.getLockMinutes()), ChronoUnit.MINUTES));
                transaction.setOtpCode(null);
                transaction.setOtpExpiresAt(null);
                transaction.setOtpFailedAttempts(0);
            }
            transactionRepository.save(transaction);
            throw new BadRequestException(
                    fails >= maxFails
                            ? MessageConstants.TRANSACTION_OTP_BRUTE_FORCE
                            : MessageConstants.OTP_INVALID_OR_EXPIRED);
        }

        transaction.setOtpCode(null);
        transaction.setOtpExpiresAt(null);
        transaction.setOtpFailedAttempts(0);
        transaction.setOtpLockedUntil(null);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(transaction);
        productSoldMarker.markSold(transaction.getProduct().getId());
    }

    private static boolean isLockedForVerify(Transaction t) {
        Instant lockUntil = t.getOtpLockedUntil();
        return lockUntil != null && lockUntil.isAfter(Instant.now());
    }

    private Transaction load(UUID id) {
        return transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
    }

    private static void requireAccepted(Transaction transaction) {
        TransactionStatus status = transaction.getStatus();
        if (status != TransactionStatus.ACCEPTED && status != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.OTP_REQUIRES_ACCEPTED);
        }
    }
}
