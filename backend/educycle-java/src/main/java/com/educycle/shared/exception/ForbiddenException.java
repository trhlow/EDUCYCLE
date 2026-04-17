package com.educycle.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * HTTP 403 — ví dụ: không phải buyer/seller của giao dịch khi gọi OTP.
 */
public class ForbiddenException extends AppException {
    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}
