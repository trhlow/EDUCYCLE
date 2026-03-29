package com.educycle.service.impl;

import com.educycle.dto.admin.AdminResolveTransactionRequest;
import com.educycle.dto.transaction.CancelTransactionRequest;
import com.educycle.dto.transaction.CreateTransactionRequest;
import com.educycle.dto.transaction.DisputeTransactionRequest;
import com.educycle.dto.transaction.TransactionResponse;
import com.educycle.dto.transaction.UpdateTransactionStatusRequest;
import com.educycle.enums.ProductStatus;
import com.educycle.enums.TransactionStatus;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.ForbiddenException;
import com.educycle.exception.NotFoundException;
import com.educycle.model.Product;
import com.educycle.model.Transaction;
import com.educycle.model.User;
import com.educycle.repository.ProductRepository;
import com.educycle.repository.TransactionRepository;
import com.educycle.repository.UserRepository;
import com.educycle.service.NotificationService;
import com.educycle.service.TransactionService;
import com.educycle.util.MessageConstants;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository     productRepository;
    private final UserRepository        userRepository;
    private final NotificationService   notificationService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Override
    public TransactionResponse create(CreateTransactionRequest request, UUID buyerId) {
        if (buyerId.equals(request.sellerId())) {
            throw new BadRequestException(MessageConstants.BUYER_SAME_AS_SELLER);
        }

        User buyer  = userRepository.findById(buyerId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.BUYER_NOT_FOUND));
        User seller = userRepository.findById(request.sellerId())
                .orElseThrow(() -> new NotFoundException(MessageConstants.SELLER_NOT_FOUND));
        Product product = productRepository.findByIdWithUser(request.productId())
                .orElseThrow(() -> new NotFoundException(MessageConstants.PRODUCT_NOT_FOUND));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException(
                    MessageConstants.PRODUCT_NOT_AVAILABLE_PREFIX + product.getStatus() + ")");
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

        notificationService.create(
                request.sellerId(),
                "NEW_TRANSACTION_REQUEST",
                "Yêu cầu mua mới",
                "Bạn có yêu cầu mua mới cho sản phẩm '" + product.getName() + "'.",
                transaction.getId());

        return mapToResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(UUID id) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));
        return mapToResponse(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getAll() {
        return transactionRepository.findAllWithDetails()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getMyTransactions(UUID userId) {
        return transactionRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TransactionResponse updateStatus(UUID id, UUID actorUserId, UpdateTransactionStatusRequest request) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        assertParticipant(t, actorUserId);

        String rawStatus = request.status();
        if (rawStatus != null && "DISPUTED".equalsIgnoreCase(rawStatus.trim())) {
            throw new BadRequestException(MessageConstants.USE_DISPUTE_ENDPOINT_FOR_DISPUTED);
        }

        final TransactionStatus newStatus;
        try {
            newStatus = TransactionStatus.valueOf(request.status().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    MessageConstants.INVALID_TRANSACTION_STATUS_PREFIX + request.status());
        }

        if (newStatus == TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.TRANSACTION_MEETING_DEPRECATED);
        }

        TransactionStatus current = t.getStatus();

        if (newStatus == TransactionStatus.CANCELLED) {
            if (current == TransactionStatus.ACCEPTED || current == TransactionStatus.MEETING) {
                throw new BadRequestException(MessageConstants.TRANSACTION_USE_CANCEL_ENDPOINT);
            }
            if (current == TransactionStatus.PENDING) {
                if (!t.getBuyer().getId().equals(actorUserId)) {
                    throw new ForbiddenException(MessageConstants.TRANSACTION_CANCEL_PENDING_BUYER_ONLY);
                }
            } else {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else if (newStatus == TransactionStatus.ACCEPTED) {
            if (current != TransactionStatus.PENDING || !t.getSeller().getId().equals(actorUserId)) {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else if (newStatus == TransactionStatus.REJECTED) {
            if (current != TransactionStatus.PENDING || !t.getSeller().getId().equals(actorUserId)) {
                throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
            }
        } else {
            throw new BadRequestException(MessageConstants.TRANSACTION_STATUS_TRANSITION_INVALID);
        }

        t.setStatus(newStatus);
        transactionRepository.save(t);

        notificationService.create(
                t.getBuyer().getId(),
                "TRANSACTION_STATUS_CHANGED",
                "Giao dịch được cập nhật",
                "Giao dịch của bạn đã được cập nhật sang trạng thái: " + newStatus.name(),
                t.getId());
        if (!t.getSeller().getId().equals(t.getBuyer().getId())) {
            notificationService.create(
                    t.getSeller().getId(),
                    "TRANSACTION_STATUS_CHANGED",
                    "Giao dịch được cập nhật",
                    "Giao dịch của bạn đã được cập nhật sang trạng thái: " + newStatus.name(),
                    t.getId());
        }

        return mapToResponse(t);
    }

    @Override
    public TransactionResponse cancelTransaction(UUID id, UUID actorUserId, CancelTransactionRequest request) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        assertParticipant(t, actorUserId);

        TransactionStatus current = t.getStatus();
        if (current == TransactionStatus.COMPLETED
                || current == TransactionStatus.AUTO_COMPLETED
                || current == TransactionStatus.REJECTED
                || current == TransactionStatus.CANCELLED
                || current == TransactionStatus.DISPUTED) {
            throw new BadRequestException(MessageConstants.TRANSACTION_CANNOT_CANCEL);
        }

        if (current == TransactionStatus.PENDING) {
            if (!t.getBuyer().getId().equals(actorUserId)) {
                throw new ForbiddenException(MessageConstants.TRANSACTION_CANCEL_PENDING_BUYER_ONLY);
            }
        } else if (current == TransactionStatus.ACCEPTED || current == TransactionStatus.MEETING) {
            // buyer hoặc seller
        } else {
            throw new BadRequestException(MessageConstants.TRANSACTION_CANNOT_CANCEL);
        }

        String reason = null;
        if (request != null && request.reason() != null) {
            String r = request.reason().trim();
            reason = r.isEmpty() ? null : r;
        }

        t.setStatus(TransactionStatus.CANCELLED);
        t.setCancelReason(reason);
        t.setCancelledAt(Instant.now());
        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        transactionRepository.save(t);

        UUID otherPartyId = t.getBuyer().getId().equals(actorUserId)
                ? t.getSeller().getId()
                : t.getBuyer().getId();
        String preview = reason != null && reason.length() > 200 ? reason.substring(0, 200) + "..." : (reason != null ? reason : "(Không ghi lý do)");
        notificationService.create(
                otherPartyId,
                "TRANSACTION_CANCELLED",
                "Giao dịch đã hủy",
                "Đối tác đã hủy giao dịch. Lý do: " + preview,
                t.getId());

        return mapToResponse(t);
    }

    @Override
    public Map<String, String> generateOtp(UUID id, UUID actorUserId) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        if (t.getBuyer() == null || !t.getBuyer().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.OTP_GENERATE_BUYER_ONLY);
        }

        TransactionStatus st = t.getStatus();
        if (st != TransactionStatus.ACCEPTED && st != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.OTP_REQUIRES_ACCEPTED);
        }

        if (t.getOtpCode() != null
                && t.getOtpExpiresAt() != null
                && t.getOtpExpiresAt().isAfter(Instant.now())) {
            throw new BadRequestException(MessageConstants.OTP_ALREADY_ACTIVE);
        }

        String otp = String.format("%06d", 100000 + SECURE_RANDOM.nextInt(900000));
        t.setOtpCode(OtpHasher.hash(otp));
        t.setOtpExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        transactionRepository.save(t);

        log.info("OTP generated for transaction {}", id);
        return Map.of("otp", otp);
    }

    @Override
    public void verifyOtp(UUID id, String otp, UUID actorUserId) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        if (t.getSeller() == null || !t.getSeller().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.OTP_VERIFY_SELLER_ONLY);
        }

        TransactionStatus st = t.getStatus();
        if (st != TransactionStatus.ACCEPTED && st != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.OTP_REQUIRES_ACCEPTED);
        }

        if (t.getOtpCode() == null
                || !OtpHasher.verify(otp, t.getOtpCode())
                || t.getOtpExpiresAt() == null
                || t.getOtpExpiresAt().isBefore(Instant.now())) {
            throw new BadRequestException(MessageConstants.OTP_INVALID_OR_EXPIRED);
        }

        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        t.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(t);

        markProductAsSold(t.getProduct().getId());
    }

    @Override
    public TransactionResponse confirmReceipt(UUID id, UUID actorUserId) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        if (t.getBuyer() == null || !t.getBuyer().getId().equals(actorUserId)) {
            throw new ForbiddenException(MessageConstants.CONFIRM_RECEIPT_BUYER_ONLY);
        }

        TransactionStatus st = t.getStatus();
        if (st != TransactionStatus.ACCEPTED && st != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.CONFIRM_RECEIPT_INVALID_STATUS);
        }

        t.setBuyerConfirmed(true);
        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        t.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(t);

        markProductAsSold(t.getProduct().getId());
        return mapToResponse(t);
    }

    @Override
    public TransactionResponse openDispute(UUID id, UUID buyerId, DisputeTransactionRequest request) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        if (t.getBuyer() == null || !t.getBuyer().getId().equals(buyerId)) {
            throw new ForbiddenException(MessageConstants.DISPUTE_ONLY_BUYER);
        }
        TransactionStatus st = t.getStatus();
        if (st != TransactionStatus.ACCEPTED && st != TransactionStatus.MEETING) {
            throw new BadRequestException(MessageConstants.DISPUTE_REQUIRES_ACCEPTED);
        }

        String reason = null;
        if (request != null && request.reason() != null) {
            String r = request.reason().trim();
            reason = r.isEmpty() ? null : r;
        }

        t.setStatus(TransactionStatus.DISPUTED);
        t.setDisputeReason(reason);
        t.setDisputedAt(Instant.now());
        t.setOtpCode(null);
        t.setOtpExpiresAt(null);
        transactionRepository.save(t);

        String preview = reason != null && reason.length() > 200 ? reason.substring(0, 200) + "..." : (reason != null ? reason : "(Không ghi lý do)");
        notificationService.create(
                t.getSeller().getId(),
                "TRANSACTION_DISPUTED",
                "Giao dịch bị báo tranh chấp",
                "Người mua đã báo tranh chấp. Lý do: " + preview,
                t.getId());
        notificationService.create(
                t.getBuyer().getId(),
                "TRANSACTION_DISPUTED",
                "Đã gửi báo tranh chấp",
                "Bạn đã báo tranh chấp giao dịch. Admin sẽ xem xét.",
                t.getId());

        return mapToResponse(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> listDisputedTransactions() {
        return transactionRepository.findByStatusWithDetails(TransactionStatus.DISPUTED)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TransactionResponse adminResolveDispute(UUID id, AdminResolveTransactionRequest request) {
        Transaction t = transactionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new NotFoundException(MessageConstants.TRANSACTION_NOT_FOUND.formatted(id)));

        if (t.getStatus() != TransactionStatus.DISPUTED) {
            throw new BadRequestException(MessageConstants.TRANSACTION_NOT_DISPUTED);
        }

        String res = request.resolution().trim().toUpperCase();
        if (!"COMPLETED".equals(res) && !"CANCELLED".equals(res)) {
            throw new BadRequestException(MessageConstants.ADMIN_RESOLUTION_INVALID);
        }

        String note = request.adminNote() == null ? "" : request.adminNote().trim();
        String noteLine = note.isEmpty() ? "" : "\nGhi chú admin: " + note;

        if ("COMPLETED".equals(res)) {
            t.setStatus(TransactionStatus.COMPLETED);
            t.setOtpCode(null);
            t.setOtpExpiresAt(null);
            transactionRepository.save(t);
            markProductAsSold(t.getProduct().getId());
        } else {
            t.setStatus(TransactionStatus.CANCELLED);
            transactionRepository.save(t);
        }

        String body = "Admin đã xử lý tranh chấp với kết quả: " + res + "." + noteLine;
        notificationService.create(
                t.getBuyer().getId(),
                "DISPUTE_RESOLVED",
                "Tranh chấp đã được xử lý",
                body,
                t.getId());
        notificationService.create(
                t.getSeller().getId(),
                "DISPUTE_RESOLVED",
                "Tranh chấp đã được xử lý",
                body,
                t.getId());

        return mapToResponse(t);
    }

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

        // FIX: include description and category — FE needs both fields
        TransactionResponse.TransactionProductDto product = t.getProduct() != null
                ? new TransactionResponse.TransactionProductDto(
                        t.getProduct().getId().toString(),
                        t.getProduct().getName(),
                        t.getProduct().getPrice(),
                        t.getProduct().getImageUrl(),
                        t.getProduct().getDescription(),
                        t.getProduct().getCategory())
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
                t.getCreatedAt(),
                t.getUpdatedAt(),
                t.getDisputeReason(),
                t.getDisputedAt(),
                t.getCancelReason(),
                t.getCancelledAt()
        );
    }

    private void assertParticipant(Transaction t, UUID actorUserId) {
        boolean buyerOk = t.getBuyer() != null && t.getBuyer().getId().equals(actorUserId);
        boolean sellerOk = t.getSeller() != null && t.getSeller().getId().equals(actorUserId);
        if (!buyerOk && !sellerOk) {
            throw new ForbiddenException(MessageConstants.TRANSACTION_NOT_PARTICIPANT);
        }
    }
}
