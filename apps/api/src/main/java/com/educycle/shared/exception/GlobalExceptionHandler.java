package com.educycle.shared.exception;

import com.educycle.shared.response.ApiErrorBody;
import com.educycle.shared.util.MessageConstants;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Khớp tên constraint Flyway — xem db/migration */
    private static final String UQ_USERS_EMAIL = "uq_users_email";
    private static final String UQ_USERS_USERNAME = "uq_users_username";
    private static final int MAX_INTEGRITY_CAUSE_DEPTH = 8;

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorBody> handleNotReadable(HttpMessageNotReadableException ex) {
        // Không log ex.getMessage() ở WARN — có thể chứa đoạn payload/field từ parser.
        log.warn("Malformed or invalid JSON body");
        log.debug("Malformed or invalid JSON body", ex);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorBody.of(MessageConstants.VALIDATION_FAILED,
                        List.of("Dữ liệu JSON không hợp lệ hoặc không đúng định dạng.")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorBody> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiErrorBody.of(MessageConstants.VALIDATION_FAILED, errors));
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiErrorBody> handleAppException(AppException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(ApiErrorBody.of(ex.getMessage()));
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiErrorBody> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        // Không log ex.getMessage() ở WARN — có thể chứa chi tiết entity/version từ persistence.
        log.warn("Optimistic lock conflict");
        log.debug("Optimistic lock conflict", ex);
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiErrorBody.of(MessageConstants.CONCURRENT_UPDATE));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorBody> handleAccessDenied(AccessDeniedException ex) {
        log.debug("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiErrorBody.of(MessageConstants.FORBIDDEN_GENERIC));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorBody> handleBadCredentials(BadCredentialsException ex) {
        log.debug("Bad credentials: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorBody.of(MessageConstants.INVALID_CREDENTIALS));
    }

    @ExceptionHandler({
            InsufficientAuthenticationException.class,
            AuthenticationCredentialsNotFoundException.class
    })
    public ResponseEntity<ApiErrorBody> handleAuthRequired(RuntimeException ex) {
        log.debug("Authentication required: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorBody.of(MessageConstants.AUTH_REQUIRED));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorBody> handleAuthentication(AuthenticationException ex) {
        log.debug("Authentication failed: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiErrorBody.of(MessageConstants.AUTH_REQUIRED));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorBody> handleDataIntegrity(DataIntegrityViolationException ex) {
        Optional<String> constraintOpt = extractConstraintName(ex);
        String detail = constraintOpt.isEmpty() ? ex.getMostSpecificCause().getMessage() : null;

        DataIntegrityResolution resolution = resolveDataIntegrity(constraintOpt, detail);
        log.warn("Data integrity violation, constraint={}", resolution.logLabel());

        return ResponseEntity
                .status(resolution.status())
                .body(ApiErrorBody.of(resolution.message()));
    }

    private record DataIntegrityResolution(String message, HttpStatus status, String logLabel) {
    }

    private static DataIntegrityResolution resolveDataIntegrity(Optional<String> constraintOpt, String detail) {
        if (constraintOpt.isPresent()) {
            String key = normalizeConstraintKey(constraintOpt.get());
            if (key.contains(UQ_USERS_EMAIL)) {
                return new DataIntegrityResolution(
                        MessageConstants.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT, key);
            }
            if (key.contains(UQ_USERS_USERNAME)) {
                return new DataIntegrityResolution(
                        MessageConstants.USERNAME_TAKEN, HttpStatus.CONFLICT, key);
            }
            return new DataIntegrityResolution(MessageConstants.DUPLICATE_DATA, HttpStatus.BAD_REQUEST, key);
        }
        if (detail != null) {
            if (detail.contains(UQ_USERS_EMAIL)) {
                return new DataIntegrityResolution(
                        MessageConstants.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT, UQ_USERS_EMAIL);
            }
            if (detail.contains(UQ_USERS_USERNAME)) {
                return new DataIntegrityResolution(
                        MessageConstants.USERNAME_TAKEN, HttpStatus.CONFLICT, UQ_USERS_USERNAME);
            }
        }
        return new DataIntegrityResolution(MessageConstants.DUPLICATE_DATA, HttpStatus.BAD_REQUEST, "unknown");
    }

    private static Optional<String> extractConstraintName(DataIntegrityViolationException ex) {
        Throwable t = ex;
        for (int i = 0; i < MAX_INTEGRITY_CAUSE_DEPTH && t != null; i++) {
            if (t instanceof ConstraintViolationException cv) {
                String name = cv.getConstraintName();
                if (name != null && !name.isBlank()) {
                    return Optional.of(name);
                }
            }
            t = t.getCause();
        }
        return Optional.empty();
    }

    private static String normalizeConstraintKey(String raw) {
        return raw.replace("\"", "").toLowerCase();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorBody> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiErrorBody.of(MessageConstants.UNEXPECTED_ERROR));
    }
}
