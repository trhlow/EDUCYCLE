package com.educycle.transaction.domain;

import java.util.EnumSet;
import java.util.Set;

public final class TransactionStatuses {

    private static final Set<TransactionStatus> ACTIVE_FOR_PRODUCT_AVAILABILITY = Set.copyOf(EnumSet.of(
            TransactionStatus.PENDING,
            TransactionStatus.ACCEPTED,
            TransactionStatus.MEETING,
            TransactionStatus.DISPUTED));

    private TransactionStatuses() {
    }

    public static Set<TransactionStatus> activeForProductAvailability() {
        return ACTIVE_FOR_PRODUCT_AVAILABILITY;
    }
}
