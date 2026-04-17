package com.educycle.shared.util;

/**
 * Ẩn thông tin nhạy cảm trong API (username công khai, email đối tác giao dịch, …).
 */
public final class PrivacyHelper {

    private PrivacyHelper() {
    }

    /**
     * Che username — khớp logic {@code frontend/src/utils/maskUsername.js}.
     */
    public static String maskUsername(String name) {
        if (name == null || name.isBlank()) {
            return "Ẩn danh";
        }
        String trimmed = name.trim();
        if (trimmed.length() <= 1) {
            return trimmed + "***";
        }
        if (trimmed.length() <= 3) {
            return trimmed.charAt(0) + "***" + trimmed.charAt(trimmed.length() - 1);
        }
        return trimmed.substring(0, 3) + "***" + trimmed.charAt(trimmed.length() - 1);
    }

    /**
     * Che email — gần với {@code maskEmail} FE (local@***.tld).
     */
    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "***@***.***";
        }
        String e = email.trim();
        int at = e.indexOf('@');
        if (at <= 0) {
            return "***@***.***";
        }
        String local = e.substring(0, at);
        String domain = e.substring(at + 1);
        int dotIdx = domain.lastIndexOf('.');
        String tld = dotIdx >= 0 ? domain.substring(dotIdx + 1) : "***";

        String visibleLocal = local.length() > 3
                ? local.substring(0, 3) + "***"
                : local.charAt(0) + "***";

        return visibleLocal + "@***." + tld;
    }
}
