package com.educycle.shared.response;

import java.util.List;

/**
 * Canonical JSON error shape for API errors ({@code success=false}).
 */
public record ApiErrorBody(boolean success, String message, List<String> errors) {

    public static ApiErrorBody of(String message, List<String> errors) {
        return new ApiErrorBody(false, message, errors);
    }

    public static ApiErrorBody of(String message) {
        return of(message, List.of());
    }
}
