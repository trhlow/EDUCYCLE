package com.educycle.transaction.application.support;

import com.educycle.shared.exception.ForbiddenException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.transaction.domain.Transaction;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TransactionAccessService {

    public void assertCanView(Transaction transaction, UUID actorUserId, boolean admin) {
        if (admin || isParticipant(transaction, actorUserId)) {
            return;
        }
        throw new ForbiddenException(MessageConstants.FORBIDDEN_GENERIC);
    }

    public void assertParticipant(Transaction transaction, UUID actorUserId) {
        if (isParticipant(transaction, actorUserId)) {
            return;
        }
        throw new ForbiddenException(MessageConstants.FORBIDDEN_GENERIC);
    }

    private static boolean isParticipant(Transaction transaction, UUID actorUserId) {
        return transaction != null
                && actorUserId != null
                && transaction.getBuyer() != null
                && transaction.getSeller() != null
                && (actorUserId.equals(transaction.getBuyer().getId())
                || actorUserId.equals(transaction.getSeller().getId()));
    }
}
