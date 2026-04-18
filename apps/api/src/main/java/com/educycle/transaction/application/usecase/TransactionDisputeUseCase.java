package com.educycle.transaction.application.usecase;

import com.educycle.admin.api.dto.request.AdminResolveTransactionRequest;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.api.dto.request.DisputeTransactionRequest;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.support.ProductSoldMarker;
import com.educycle.transaction.application.support.TransactionResponseMapper;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionDisputeUseCase {

    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final ProductSoldMarker productSoldMarker;
    private final TransactionResponseMapper mapper;

    public TransactionResponse openDispute(UUID id, UUID buyerId, DisputeTransactionRequest request) {
        Transaction transaction = load(id);

        if (transaction.getBuyer() == null || !transaction.getBuyer().getId().equals(buyerId)) {
            throw new ForbiddenException(MessageConstants.DISPUTE_ONLY_BUYER);
        }
        TransactionStatus status = transaction.getStatus();
        if (status != TransactionStatus.ACCEPTED && status != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.DISPUTE_REQUIRES_ACCEPTED);
        }

        String reason = normalizedReason(request);
        transaction.setStatus(TransactionStatus.DISPUTED);
        transaction.setDisputeReason(reason);
        transaction.setDisputedAt(Instant.now());
        transaction.setOtpCode(null);
        transaction.setOtpExpiresAt(null);
        transactionRepository.save(transaction);

        notificationService.create(
                transaction.getSeller().getId(),
                "TRANSACTION_DISPUTED",
                "Giao dịch bị báo tranh chấp",
                "Người mua đã báo tranh chấp. Lý do: " + preview(reason),
                transaction.getId());
        notificationService.create(
                transaction.getBuyer().getId(),
                "TRANSACTION_DISPUTED",
                "Đã gửi báo tranh chấp",
                "Bạn đã báo tranh chấp giao dịch. Admin sẽ xem xét.",
                transaction.getId());

        return mapper.toResponse(transaction);
    }

    public TransactionResponse adminResolveDispute(UUID id, AdminResolveTransactionRequest request) {
        Transaction transaction = load(id);
        if (transaction.getStatus() != TransactionStatus.DISPUTED) {
            throw new BadRequestException(MessageConstants.TRANSACTION_NOT_DISPUTED);
        }

        String resolution = request.resolution().trim().toUpperCase();
        if (!"COMPLETED".equals(resolution) && !"CANCELLED".equals(resolution)) {
            throw new BadRequestException(MessageConstants.ADMIN_RESOLUTION_INVALID);
        }

        String note = request.adminNote() == null ? "" : request.adminNote().trim();
        String noteLine = note.isEmpty() ? "" : "\nGhi chú admin: " + note;

        if ("COMPLETED".equals(resolution)) {
            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction.setOtpCode(null);
            transaction.setOtpExpiresAt(null);
            transactionRepository.save(transaction);
            productSoldMarker.markSold(transaction.getProduct().getId());
        } else {
            transaction.setStatus(TransactionStatus.CANCELLED);
            transactionRepository.save(transaction);
        }

        String body = "Admin đã xử lý tranh chấp với kết quả: " + resolution + "." + noteLine;
        notificationService.create(
                transaction.getBuyer().getId(),
                "DISPUTE_RESOLVED",
                "Tranh chấp đã được xử lý",
                body,
                transaction.getId());
        notificationService.create(
                transaction.getSeller().getId(),
                "DISPUTE_RESOLVED",
                "Tranh chấp đã được xử lý",
                body,
                transaction.getId());

        return mapper.toResponse(transaction);
    }

    private Transaction load(UUID id) {
        return transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
    }

    private static String normalizedReason(DisputeTransactionRequest request) {
        if (request == null || request.reason() == null) {
            return null;
        }
        String reason = request.reason().trim();
        return reason.isEmpty() ? null : reason;
    }

    private static String preview(String reason) {
        if (reason == null) {
            return "(Không ghi lý do)";
        }
        return reason.length() > 200 ? reason.substring(0, 200) + "..." : reason;
    }
}
