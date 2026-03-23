package com.educycle.util;

public final class MessageConstants {

    private MessageConstants() {
    }

    public static final String INVALID_CREDENTIALS = "Thông tin đăng nhập không đúng";
    public static final String EMAIL_ALREADY_EXISTS = "Email đã tồn tại";
    public static final String USER_NOT_FOUND = "Không tìm thấy người dùng";
    public static final String EMAIL_NOT_FOUND = "Không tìm thấy email";
    public static final String OTP_INVALID_OR_EXPIRED = "Mã OTP không hợp lệ hoặc đã hết hạn";
    public static final String EMAIL_ALREADY_VERIFIED = "Email đã được xác thực";
    public static final String REFRESH_TOKEN_REQUIRED = "Bắt buộc phải có mã làm mới phiên";
    public static final String INVALID_REFRESH_TOKEN = "Mã làm mới phiên không hợp lệ";
    public static final String REFRESH_TOKEN_EXPIRED = "Mã làm mới phiên đã hết hạn. Vui lòng đăng nhập lại.";
    public static final String SOCIAL_LOGIN_EMAIL_REQUIRED_PREFIX = "Đăng nhập mạng xã hội bắt buộc phải có email. Nhà cung cấp: ";
    public static final String REGISTER_OTP_SENT = "Vui lòng xác thực email bằng mã OTP đã được gửi.";
    public static final String EMAIL_VERIFIED_SUCCESS = "Xác thực email thành công";
    public static final String OTP_RESENT_SUCCESS = "Đã gửi lại mã OTP thành công";
    public static final String OAUTH_TOKEN_REQUIRED = "Bắt buộc phải có mã đăng nhập mạng xã hội.";
    public static final String OAUTH_EMAIL_CLAIM_MISSING = "Mã đăng nhập mạng xã hội không chứa email. Hãy cấp quyền email rồi thử lại.";
    public static final String GOOGLE_ACCESS_TOKEN_VERIFY_FAILED = "Không thể xác minh mã truy cập Google.";
    public static final String GOOGLE_TOKEN_WRONG_AUDIENCE = "Token Google không được cấp cho ứng dụng này.";
    public static final String GOOGLE_ACCESS_TOKEN_EMAIL_MISSING = "Mã truy cập Google không chứa email. Hãy cấp quyền email rồi thử lại.";
    public static final String INVALID_GOOGLE_ACCESS_TOKEN = "Mã truy cập Google không hợp lệ. Vui lòng thử đăng nhập lại.";
    public static final String INVALID_OAUTH_TOKEN_PREFIX = "Mã ";
    public static final String INVALID_OAUTH_TOKEN_SUFFIX = " không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
    public static final String UNSUPPORTED_OAUTH_PROVIDER_PREFIX = "Nhà cung cấp đăng nhập mạng xã hội không được hỗ trợ: ";
    public static final String SUPPORTED_OAUTH_PROVIDERS = ". Hỗ trợ: google, microsoft";

    public static final String BUYER_SAME_AS_SELLER = "Người mua không thể trùng với người bán";
    public static final String BUYER_NOT_FOUND = "Không tìm thấy người mua";
    public static final String SELLER_NOT_FOUND = "Không tìm thấy người bán";
    public static final String PRODUCT_NOT_FOUND = "Không tìm thấy sản phẩm";
    public static final String TRANSACTION_NOT_FOUND = "Không tìm thấy giao dịch với id '%s'";
    public static final String PRODUCT_NOT_AVAILABLE_PREFIX = "Sản phẩm hiện không thể giao dịch (trạng thái: ";
    public static final String INVALID_TRANSACTION_STATUS_PREFIX = "Trạng thái giao dịch không hợp lệ: ";

    public static final String CATEGORY_NOT_FOUND = "Không tìm thấy danh mục với id '%s'";

    public static final String VALIDATION_FAILED = "Dữ liệu không hợp lệ";
    public static final String DUPLICATE_DATA = "Dữ liệu bị trùng hoặc không hợp lệ";
    public static final String UNEXPECTED_ERROR = "Đã xảy ra lỗi không mong muốn";
    public static final String TOO_MANY_REQUESTS = "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.";
    public static final String JWT_SECRET_REQUIRED = "JWT secret bắt buộc phải được cấu hình bằng biến môi trường JWT_SECRET";

    public static final String CURRENT_PASSWORD_WRONG = "Mật khẩu hiện tại không đúng";
    public static final String OTP_GENERATE_BUYER_ONLY = "Chỉ người mua mới được tạo mã OTP cho giao dịch này.";
    public static final String OTP_VERIFY_SELLER_ONLY = "Chỉ người bán mới được nhập mã OTP để hoàn tất giao dịch.";

    public static final String FORGOT_PASSWORD_GENERIC_RESPONSE =
            "Nếu email tồn tại trong hệ thống, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.";
    public static final String RESET_TOKEN_INVALID_OR_EXPIRED = "Liên kết hoặc mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
    public static final String RESET_PASSWORD_SUCCESS = "Đã đặt lại mật khẩu thành công.";
    public static final String DISPUTE_ONLY_BUYER = "Chỉ người mua mới được báo tranh chấp.";
    public static final String DISPUTE_REQUIRES_MEETING =
            "Chỉ có thể báo tranh chấp khi giao dịch đang ở trạng thái gặp mặt (MEETING).";
    public static final String DISPUTE_ONLY_BUYER_MEETING =
            "Chỉ người mua có thể báo tranh chấp, và chỉ khi giao dịch đang ở trạng thái gặp mặt (MEETING).";
    public static final String TRANSACTION_NOT_DISPUTED = "Giao dịch không ở trạng thái tranh chấp.";
    public static final String USE_DISPUTE_ENDPOINT_FOR_DISPUTED =
            "Không thể đặt trạng thái DISPUTED qua API cập nhật chung. Hãy dùng POST /transactions/{id}/dispute.";
    public static final String ADMIN_RESOLUTION_INVALID =
            "resolution phải là COMPLETED (hoàn tất) hoặc CANCELLED (hủy giao dịch).";
}
