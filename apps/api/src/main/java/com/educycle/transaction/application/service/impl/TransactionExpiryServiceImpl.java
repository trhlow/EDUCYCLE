package com.educycle.transaction.application.service.impl;

import com.educycle.shared.config.TransactionExpiryProperties;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.transaction.application.service.TransactionExpiryService;
import com.educycle.shared.util.MessageConstants;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionExpiryServiceImpl implements TransactionExpiryService {

    private final TransactionRepository   transactionRepository;
    private final NotificationService     notificationService;
    private final TransactionExpiryProperties expiryProperties;
    private final MeterRegistry           meterRegistry;

    @Override
    @Transactional
    public void expireStaleTransactions() {
        Instant now = Instant.now();

        Instant pendingCutoff = now.minus(expiryProperties.getPendingStaleHours(), ChronoUnit.HOURS);
        List<Transaction> pendingStale =
                transactionRepository.findByStatusAndCreatedAtBefore(TransactionStatus.PENDING, pendingCutoff);
        int p = 0;
        for (Transaction t : pendingStale) {
            applySystemCancellation(t, MessageConstants.TRANSACTION_EXPIRED_PENDING_SYSTEM, "pending");
            p++;
        }

        Instant acceptedCutoff = now.minus(expiryProperties.getAcceptedStaleHours(), ChronoUnit.HOURS);
        List<Transaction> acceptedStale = transactionRepository.findByStatusInAndUpdatedAtBefore(
                List.of(TransactionStatus.ACCEPTED, TransactionStatus.MEETING), acceptedCutoff);
        int a = 0;
        for (Transaction t : acceptedStale) {
            applySystemCancellation(t, MessageConstants.TRANSACTION_EXPIRED_ACCEPTED_SYSTEM, "accepted");
            a++;
        }

        if (p > 0 || a > 0) {
            log.info("Transaction expiry job: pendingExpired={}, acceptedExpired={}", p, a);
        }
    }

    private void applySystemCancellation(Transaction t, String reason, String metricKind) {
        t.setStatus(TransactionStatus.CANCELLED);
        t.setCancelReason(reason);
        t.setCancelledAt(Instant.now());
        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        transactionRepository.save(t);

        meterRegistry.counter("educycle.transactions.expired", "kind", metricKind).increment();

        String body = "Giao dịch đã tự động hủy do hết hạn. " + reason;
        notificationService.create(
                t.getBuyer().getId(),
                "TRANSACTION_EXPIRED",
                "Giao dịch hết hạn",
                body,
                t.getId());
        notificationService.create(
                t.getSeller().getId(),
                "TRANSACTION_EXPIRED",
                "Giao dịch hết hạn",
                body,
                t.getId());
    }
}
