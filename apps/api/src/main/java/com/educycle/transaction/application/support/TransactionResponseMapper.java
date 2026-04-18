package com.educycle.transaction.application.support;

import com.educycle.transaction.api.dto.response.TransactionResponse;
import com.educycle.transaction.domain.Transaction;
import com.educycle.shared.util.PrivacyHelper;
import org.springframework.stereotype.Component;

@Component
public class TransactionResponseMapper {

    public TransactionResponse toResponse(Transaction transaction) {
        TransactionResponse.TransactionUserDto buyer = transaction.getBuyer() != null
                ? new TransactionResponse.TransactionUserDto(
                        transaction.getBuyer().getId().toString(),
                        transaction.getBuyer().getUsername(),
                        PrivacyHelper.maskEmail(transaction.getBuyer().getEmail()))
                : null;

        TransactionResponse.TransactionUserDto seller = transaction.getSeller() != null
                ? new TransactionResponse.TransactionUserDto(
                        transaction.getSeller().getId().toString(),
                        transaction.getSeller().getUsername(),
                        PrivacyHelper.maskEmail(transaction.getSeller().getEmail()))
                : null;

        TransactionResponse.TransactionProductDto product = transaction.getProduct() != null
                ? new TransactionResponse.TransactionProductDto(
                        transaction.getProduct().getId().toString(),
                        transaction.getProduct().getName(),
                        transaction.getProduct().getPrice(),
                        transaction.getProduct().getImageUrl(),
                        transaction.getProduct().getDescription(),
                        transaction.getProduct().getCategory())
                : null;

        return new TransactionResponse(
                transaction.getId(),
                buyer,
                seller,
                product,
                transaction.getAmount(),
                transaction.getStatus().name(),
                transaction.isBuyerConfirmed(),
                transaction.isSellerConfirmed(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt(),
                transaction.getDisputeReason(),
                transaction.getDisputedAt(),
                transaction.getCancelReason(),
                transaction.getCancelledAt()
        );
    }
}
