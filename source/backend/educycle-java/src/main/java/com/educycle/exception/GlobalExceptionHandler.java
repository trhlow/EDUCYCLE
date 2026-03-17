package com.educycle.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

/**
 * Replaces C# ExceptionHandlingMiddleware.
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody
 * Handles: validation errors, custom AppException subclasses, generic exceptions.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ===== Error response shape (matches C# { success, message, errors }) =====
    private record ErrorResponse(boolean success, String message, List<String> errors) {
        static ErrorResponse of(String message, List<String> errors) {
            return new ErrorResponse(false, message, errors);
        }
        static ErrorResponse of(String message) {
            return of(message, List.of());
        }
    }

    /**
     * Handles @Valid / @Validated bean-validation failures.
     * Maps C# FluentValidation → Spring Bean Validation.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of("Validation failed", errors));
    }

    /**
     * Handles all custom AppException subclasses:
     * BadRequestException (400), NotFoundException (404), UnauthorizedException (401).
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(ErrorResponse.of(ex.getMessage()));
    }

    /**
     * Fallback for all unhandled exceptions → 500 Internal Server Error.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("An unexpected error occurred"));
    }
}
