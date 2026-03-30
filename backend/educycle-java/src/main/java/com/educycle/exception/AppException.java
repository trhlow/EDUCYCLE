package com.educycle.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception — maps C# abstract AppException.
 */
public abstract class AppException extends RuntimeException {

    private final HttpStatus status;

    protected AppException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
