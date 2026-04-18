package com.educycle.auth.application.support;

import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;

import java.util.Locale;
import java.util.regex.Pattern;

public final class AuthEmailPolicy {

    private static final Pattern EDU_VN_EMAIL = Pattern.compile("(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$");

    private AuthEmailPolicy() {
    }

    public static String normalize(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isEduVnInstitutionEmail(String normalizedEmail) {
        return normalizedEmail != null && EDU_VN_EMAIL.matcher(normalizedEmail).matches();
    }

    public static boolean isTradingAllowedFor(User user) {
        return user.getRole() == Role.ADMIN || isEduVnInstitutionEmail(user.getEmail());
    }
}
