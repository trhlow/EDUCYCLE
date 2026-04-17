package com.educycle.shared.util;

import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;

/**
 * Quyền tham gia giao dịch mua/bán trên sàn (đăng tin bán, gửi yêu cầu mua, v.v.).
 * Admin luôn được phép (kiểm duyệt / vận hành).
 */
public final class TradingAccess {

    private TradingAccess() {
    }

    public static boolean mayTrade(User user) {
        return user != null && (user.getRole() == Role.ADMIN || user.isTradingAllowed());
    }
}
