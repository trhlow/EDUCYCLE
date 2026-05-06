package com.educycle.shared.exception;

import com.educycle.shared.response.ApiErrorBody;
import com.educycle.shared.util.MessageConstants;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerOptimisticLockTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void optimisticLock_returnsConflictAndConcurrentUpdateMessage() {
        ObjectOptimisticLockingFailureException ex =
                new ObjectOptimisticLockingFailureException(String.class, "test-id");

        ResponseEntity<ApiErrorBody> res = handler.handleOptimisticLock(ex);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.CONCURRENT_UPDATE);
    }
}
