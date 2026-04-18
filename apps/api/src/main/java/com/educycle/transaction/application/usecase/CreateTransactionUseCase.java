package com.educycle.transaction.application.usecase;

import com.educycle.listing.domain.Product;
import com.educycle.listing.domain.ProductStatus;
import com.educycle.listing.infrastructure.persistence.ProductRepository;
import com.educycle.notification.application.service.NotificationService;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.NotFoundException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.api.dto.request.CreateTransactionRequest;
import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.application.support.TransactionResponseMapper;
import com.educycle.transaction.domain.Transaction;
import com.educycle.transaction.domain.TransactionStatus;
import com.educycle.transaction.infrastructure.persistence.TransactionRepository;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CreateTransactionUseCase {

    private static final Set<TransactionStatus> ACTIVE_TRANSACTION_STATUSES = EnumSet.of(
            TransactionStatus.PENDING,
            TransactionStatus.ACCEPTED,
            TransactionStatus.MEETING,
            TransactionStatus.DISPUTED);

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TransactionResponseMapper mapper;

    public TransactionResponse create(CreateTransactionRequest request, UUID buyerId) {
        if (buyerId.equals(request.sellerId())) {
            throw new BadRequestException(MessageConstants.BUYER_SAME_AS_SELLER);
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new NotFoundException(MessageConstants.BUYER_NOT_FOUND));
        User seller = userRepository.findById(request.sellerId())
                .orElseThrow(() -> new NotFoundException(MessageConstants.SELLER_NOT_FOUND));
        Product product = productRepository.findByIdWithUserForUpdate(request.productId())
                .orElseThrow(() -> new NotFoundException(MessageConstants.PRODUCT_NOT_FOUND));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException(
                    MessageConstants.PRODUCT_NOT_AVAILABLE_PREFIX + product.getStatus() + ")");
        }
        if (transactionRepository.existsByProduct_IdAndStatusIn(product.getId(), ACTIVE_TRANSACTION_STATUSES)) {
            throw new BadRequestException(MessageConstants.PRODUCT_HAS_ACTIVE_TRANSACTION);
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

        return mapper.toResponse(transaction);
    }
}
