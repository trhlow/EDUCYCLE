package com.educycle.shared.exception;

import com.educycle.shared.response.ApiErrorBody;
import com.educycle.shared.util.MessageConstants;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Đối chiếu review: không phản chiếu message quá dài / control chars qua {@link GlobalExceptionHandler}.
 */
class GlobalExceptionHandlerAppExceptionSafetyTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleAppException_stripsControlCharacters() {
        BadRequestException ex = new BadRequestException("Lỗi\tx\r\nở đây");

        ResponseEntity<ApiErrorBody> res = handler.handleAppException(ex);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo("Lỗi x  ở đây");
    }

    @Test
    void handleAppException_stripsIsoControl_delCharacter() {
        BadRequestException ex = new BadRequestException("a\u007Fb");

        ResponseEntity<ApiErrorBody> res = handler.handleAppException(ex);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo("a b");
    }

    @Test
    void handleAppException_replacesOversizedMessageWithUnexpected() {
        String longMsg = "x".repeat(600);
        BadRequestException ex = new BadRequestException(longMsg);

        ResponseEntity<ApiErrorBody> res = handler.handleAppException(ex);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.UNEXPECTED_ERROR);
    }

    @Test
    void handleAppException_nullMessageMapsToUnexpected() {
        BadRequestException ex = new BadRequestException("ok") {
            @Override
            public String getMessage() {
                return null;
            }
        };

        ResponseEntity<ApiErrorBody> res = handler.handleAppException(ex);

        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().message()).isEqualTo(MessageConstants.UNEXPECTED_ERROR);
    }
}
