package com.educycle.transaction.domain;

import java.util.EnumSet;
import java.util.Set;

public final class TransactionStatuses {

    private TransactionStatuses() {
    }

    public static Set<TransactionStatus> activeForProductAvailability() {
        return EnumSet.of(
                TransactionStatus.PENDING,
                TransactionStatus.ACCEPTED,
                TransactionStatus.MEETING,
                TransactionStatus.DISPUTED);
    }
}
