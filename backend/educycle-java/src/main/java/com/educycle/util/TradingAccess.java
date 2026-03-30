package com.educycle.util;

import com.educycle.enums.Role;
import com.educycle.model.User;

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
