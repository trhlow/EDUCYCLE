package com.educycle.transaction.application.usecase;

import com.educycle.notification.application.service.NotificationService;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.api.dto.request.CancelTransactionRequest;
import com.educycle.transaction.api.dto.request.UpdateTransactionStatusRequest;
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

import static com.educycle.transaction.application.support.TransactionAccess.assertParticipant;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionStatusUseCase {

    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final ProductSoldMarker productSoldMarker;
    private final TransactionResponseMapper mapper;

    public TransactionResponse updateStatus(UUID id, UUID actorUserId, UpdateTransactionStatusRequest request) {
        Transaction transaction = load(id);
        assertParticipant(transaction, actorUserId);

        String rawStatus = request.status();
        if (rawStatus != null && "DISPUTED".equalsIgnoreCase(rawStatus.trim())) {
            throw new BadRequestException(MessageConstants.USE_DISPUTE_ENDPOINT_FOR_DISPUTED);
        }

        TransactionStatus newStatus = parseStatus(request.status());
        if (newStatus == TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.TRANSACTION_MEETING_DEPRECATED);
        }

        validateTransition(transaction, actorUserId, newStatus);
        transaction.setStatus(newStatus);
        transactionRepository.save(transaction);
        notifyBothParties(transaction, newStatus);
        return mapper.toResponse(transaction);
    }

    public TransactionResponse cancelTransaction(UUID id, UUID actorUserId, CancelTransactionRequest request) {
        Transaction transaction = load(id);
        assertParticipant(transaction, actorUserId);

        TransactionStatus current = transaction.getStatus();
        if (current == TransactionStatus.COMPLETED
                || current == TransactionStatus.AUTO_COMPLETED
                || current == TransactionStatus.REJECTED
                || current == TransactionStatus.CANCELLED
                || current == TransactionStatus.DISPUTED) {
            throw new BadRequestException(MessageConstants.TRANSACTION_CANNOT_CANCEL);
        }

        if (current == TransactionStatus.PENDING && !transaction.getBuyer().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.TRANSACTION_CANCEL_PENDING_BUYER_ONLY);
        }
        if (current != TransactionStatus.PENDING
                && current != TransactionStatus.ACCEPTED
                && current != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.TRANSACTION_CANNOT_CANCEL);
        }

        String reason = normalizedReason(request);
        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction.setCancelReason(reason);
        transaction.setCancelledAt(Instant.now());
        transaction.setOtpCode(null);
        transaction.setOtpExpiresAt(null);
        transactionRepository.save(transaction);

        UUID otherPartyId = transaction.getBuyer().getId().equals(actorUserId)
                ? transaction.getSeller().getId()
                : transaction.getBuyer().getId();
        notificationService.create(
                otherPartyId,
                "TRANSACTION_CANCELLED",
                "Giao dịch đã hủy",
                "Đối tác đã hủy giao dịch. Lý do: " + preview(reason),
                transaction.getId());

        return mapper.toResponse(transaction);
    }

    public TransactionResponse confirmReceipt(UUID id, UUID actorUserId) {
        Transaction transaction = load(id);

        if (transaction.getBuyer() == null || !transaction.getBuyer().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.CONFIRM_RECEIPT_BUYER_ONLY);
        }
        TransactionStatus status = transaction.getStatus();
        if (status != TransactionStatus.ACCEPTED && status != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.CONFIRM_RECEIPT_INVALID_STATUS);
        }

        transaction.setBuyerConfirmed(true);
        transaction.setOtpCode(null);
        transaction.setOtpExpiresAt(null);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(transaction);

        productSoldMarker.markSold(transaction.getProduct().getId());
        return mapper.toResponse(transaction);
    }

    private Transaction load(UUID id) {
        return transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
    }

    private static TransactionStatus parseStatus(String rawStatus) {
        try {
            return TransactionStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(MessageConstants.INVALID_TRANSACTION_STATUS_PREFIX + rawStatus);
        }
    }

    private static void validateTransition(Transaction transaction, UUID actorUserId, TransactionStatus newStatus) {
        TransactionStatus current = transaction.getStatus();
        if (newStatus == TransactionStatus.CANCELLED) {
            if (current == TransactionStatus.ACCEPTED || current == TransactionStatus.MEETING) {
                throw new BadRequestException(MessageConstants.TRANSACTION_USE_CANCEL_ENDPOINT);
            }
            if (current == TransactionStatus.PENDING) {
                if (!transaction.getBuyer().getId().equals(actorUserId)) {
                    throw new ForbiddenException(MessageConstants.TRANSACTION_CANCEL_PENDING_BUYER_ONLY);
                }
            } else {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else if (newStatus == TransactionStatus.ACCEPTED) {
            if (current != TransactionStatus.PENDING || !transaction.getSeller().getId().equals(actorUserId)) {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else if (newStatus == TransactionStatus.REJECTED) {
            if (current != TransactionStatus.PENDING || !transaction.getSeller().getId().equals(actorUserId)) {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else {
            throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
        }
    }

    private void notifyBothParties(Transaction transaction, TransactionStatus newStatus) {
        notificationService.create(
                transaction.getBuyer().getId(),
                "TRANSACTION_STATUS_CHANGED",
                "Giao dịch được cập nhật",
                "Giao dịch của bạn đã được cập nhật sang trạng thái: " + newStatus.name(),
                transaction.getId());
        if (!transaction.getSeller().getId().equals(transaction.getBuyer().getId())) {
            notificationService.create(
                    transaction.getSeller().getId(),
                    "TRANSACTION_STATUS_CHANGED",
                    "Giao dịch được cập nhật",
                    "Giao dịch của bạn đã được cập nhật sang trạng thái: " + newStatus.name(),
                    transaction.getId());
        }
    }

    private static String normalizedReason(CancelTransactionRequest request) {
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
