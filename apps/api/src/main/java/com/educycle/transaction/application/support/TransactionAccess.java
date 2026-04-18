package com.educycle.transaction.application.support;

import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.domain.Transaction;

import java.util.UUID;

public final class TransactionAccess {

    private TransactionAccess() {
    }

    public static void assertParticipant(Transaction transaction, UUID actorUserId) {
        boolean buyerOk = transaction.getBuyer() != null && transaction.getBuyer().getId().equals(actorUserId);
        boolean sellerOk = transaction.getSeller() != null && transaction.getSeller().getId().equals(actorUserId);
        if (!buyerOk && !sellerOk) {
            throw new ForbiddenException(MessageConstants.TRANSACTION_NOT_PARTICIPANT);
        }
    }
}
