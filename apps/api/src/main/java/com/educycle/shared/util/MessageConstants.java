package com.educycle.shared.util;

public final class MessageConstants {

    private MessageConstants() {
    }

    public static final String INVALID_CREDENTIALS = "Thông tin đăng nhập không đúng";
    /** Khi thiếu JWT / chưa đăng nhập nhưng endpoint yêu cầu xác thực */
    public static final String AUTH_REQUIRED = "Cần đăng nhập để thực hiện thao tác này.";
    /** Truy cập bị từ chối (không đủ quyền) */
    public static final String FORBIDDEN_GENERIC = "Bạn không có quyền thực hiện thao tác này.";
    public static final String USERNAME_TAKEN = "Tên người dùng đã được sử dụng.";
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
    /** Đăng nhập khi email chưa qua OTP sau đăng ký */
    public static final String EMAIL_NOT_VERIFIED_LOGIN =
            "Email chưa được xác thực. Kiểm tra hộp thư .edu.vn và nhập mã OTP trên trang đăng ký trước khi đăng nhập.";
    public static final String EMAIL_VERIFIED_SUCCESS = "Xác thực email thành công";
    public static final String OTP_RESENT_SUCCESS = "Đã gửi lại mã OTP thành công";
    public static final String OAUTH_TOKEN_REQUIRED = "Bắt buộc phải có mã đăng nhập mạng xã hội.";
    /** Khi bật {@code app.oauth-require-edu-vn} — khớp chính sách đăng ký {@link com.educycle.auth.api.dto.request.RegisterRequest} */
    public static final String OAUTH_EMAIL_EDU_VN_REQUIRED =
            "EduCycle chỉ chấp nhận email trường (.edu.vn) cho đăng nhập Google/Microsoft. "
                    + "Hãy dùng tài khoản trường cấp hoặc đăng ký bằng email .edu.vn.";
    public static final String OAUTH_EMAIL_CLAIM_MISSING = "Mã đăng nhập mạng xã hội không chứa email. Hãy cấp quyền email rồi thử lại.";
    public static final String GOOGLE_ACCESS_TOKEN_VERIFY_FAILED = "Không thể xác minh mã truy cập Google.";
    public static final String GOOGLE_TOKEN_WRONG_AUDIENCE = "Token Google không được cấp cho ứng dụng này.";
    public static final String GOOGLE_ACCESS_TOKEN_EMAIL_MISSING = "Mã truy cập Google không chứa email. Hãy cấp quyền email rồi thử lại.";
    public static final String INVALID_GOOGLE_ACCESS_TOKEN = "Mã truy cập Google không hợp lệ. Vui lòng thử đăng nhập lại.";
    public static final String INVALID_OAUTH_TOKEN_PREFIX = "Mã ";
    public static final String INVALID_OAUTH_TOKEN_SUFFIX = " không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.";
    public static final String UNSUPPORTED_OAUTH_PROVIDER_PREFIX = "Nhà cung cấp đăng nhập mạng xã hội không được hỗ trợ: ";
    public static final String SUPPORTED_OAUTH_PROVIDERS = ". Hỗ trợ: google, microsoft";

    /** Tài khoản không có email trường (.edu.vn) — chỉ xem, không mua/bán trên sàn */
    public static final String TRADING_NOT_ALLOWED =
            "Tài khoản này chỉ xem được nội dung. Để đăng bán hoặc gửi yêu cầu mua, cần đăng ký bằng email .edu.vn.";

    public static final String BUYER_SAME_AS_SELLER = "Người mua không thể trùng với người bán";
    public static final String BUYER_NOT_FOUND = "Không tìm thấy người mua";
    public static final String SELLER_NOT_FOUND = "Không tìm thấy người bán";
    public static final String PRODUCT_NOT_FOUND = "Không tìm thấy sản phẩm";
    public static final String TRANSACTION_NOT_FOUND = "Không tìm thấy giao dịch với id '%s'";
    public static final String PRODUCT_NOT_AVAILABLE_PREFIX = "Sản phẩm hiện không thể giao dịch (trạng thái: ";
    /** Đã có giao dịch PENDING/ACCEPTED/MEETING/DISPUTED — chống double booking */
    public static final String PRODUCT_HAS_ACTIVE_TRANSACTION =
            "Sản phẩm đang có giao dịch đang xử lý. Vui lòng chọn sản phẩm khác hoặc thử lại sau.";
    public static final String INVALID_TRANSACTION_STATUS_PREFIX = "Trạng thái giao dịch không hợp lệ: ";

    public static final String CATEGORY_NOT_FOUND = "Không tìm thấy danh mục với id '%s'";

    public static final String VALIDATION_FAILED = "Dữ liệu không hợp lệ";
    public static final String DUPLICATE_DATA = "Dữ liệu bị trùng hoặc không hợp lệ";
    public static final String UNEXPECTED_ERROR = "Đã xảy ra lỗi không mong muốn";
    public static final String TOO_MANY_REQUESTS = "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.";
    public static final String JWT_SECRET_REQUIRED = "JWT secret bắt buộc phải được cấu hình bằng biến môi trường JWT_SECRET";
    public static final String JWT_SECRET_TOO_SHORT = "JWT_SECRET phải có ít nhất 32 ký tự";
    public static final String REQUIRED_CONFIG_MISSING_PREFIX = "Thiếu cấu hình bắt buộc: ";

    public static final String CURRENT_PASSWORD_WRONG = "Mật khẩu hiện tại không đúng";
    public static final String OTP_GENERATE_BUYER_ONLY = "Chỉ người mua mới được tạo mã OTP cho giao dịch này.";
    public static final String OTP_VERIFY_SELLER_ONLY = "Chỉ người bán mới được nhập mã OTP để hoàn tất giao dịch.";
    public static final String OTP_REQUIRES_ACCEPTED =
            "Chỉ có thể tạo hoặc xác nhận OTP khi giao dịch đã được chấp nhận (ACCEPTED).";

    public static final String OTP_ALREADY_ACTIVE =
            "Mã OTP cho giao dịch này đã được tạo và chưa hết hạn. Hãy dùng mã hiện tại hoặc chờ hết hạn rồi tạo lại.";

    public static final String TRANSACTION_OTP_LOCKED =
            "Tạm khóa nhập OTP. Vui lòng thử lại sau hoặc nhờ người mua tạo mã OTP mới.";

    public static final String TRANSACTION_OTP_BRUTE_FORCE =
            "Đã thử sai OTP quá nhiều lần. Người mua cần tạo mã OTP mới sau khi hết thời gian khóa.";

    public static final String CONCURRENT_UPDATE =
            "Dữ liệu đã được cập nhật. Vui lòng tải lại và thử lại.";

    public static final String CONFIRM_RECEIPT_BUYER_ONLY = "Chỉ người mua mới xác nhận nhận hàng.";

    public static final String CONFIRM_RECEIPT_INVALID_STATUS =
            "Chỉ có thể xác nhận nhận hàng khi giao dịch ở trạng thái ACCEPTED hoặc MEETING.";

    public static final String FORGOT_PASSWORD_GENERIC_RESPONSE =
            "Nếu email tồn tại trong hệ thống, bạn sẽ nhận hướng dẫn đặt lại mật khẩu.";
    public static final String RESET_TOKEN_INVALID_OR_EXPIRED = "Liên kết hoặc mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
    public static final String RESET_PASSWORD_SUCCESS = "Đã đặt lại mật khẩu thành công.";
    public static final String DISPUTE_ONLY_BUYER = "Chỉ người mua mới được báo tranh chấp.";
    public static final String DISPUTE_REQUIRES_ACCEPTED =
            "Chỉ có thể báo tranh chấp khi giao dịch đã được chấp nhận (ACCEPTED) và chưa hoàn tất.";
    public static final String DISPUTE_ONLY_BUYER_MEETING =
            "Chỉ người mua có thể báo tranh chấp, và chỉ khi giao dịch đang ở trạng thái gặp mặt (MEETING).";
    public static final String TRANSACTION_NOT_DISPUTED = "Giao dịch không ở trạng thái tranh chấp.";
    public static final String USE_DISPUTE_ENDPOINT_FOR_DISPUTED =
            "Không thể đặt trạng thái DISPUTED qua API cập nhật chung. Hãy dùng POST /transactions/{id}/dispute.";
    public static final String ADMIN_RESOLUTION_INVALID =
            "resolution phải là COMPLETED (hoàn tất) hoặc CANCELLED (hủy giao dịch).";

    public static final String TRANSACTION_NOT_PARTICIPANT =
            "Chỉ người mua hoặc người bán trong giao dịch mới thực hiện được thao tác này.";
    public static final String TRANSACTION_USE_CANCEL_ENDPOINT =
            "Để hủy giao dịch đã chấp nhận, dùng POST /api/transactions/{id}/cancel.";
    public static final String TRANSACTION_MEETING_DEPRECATED =
            "Trạng thái MEETING không còn dùng. Tạo OTP trực tiếp khi giao dịch ở ACCEPTED.";

    public static final String TRANSACTION_CANCEL_PENDING_BUYER_ONLY =
            "Chỉ người mua mới hủy được yêu cầu khi giao dịch đang chờ xác nhận.";
    public static final String TRANSACTION_CANNOT_CANCEL =
            "Không thể hủy giao dịch ở trạng thái hiện tại.";
    public static final String TRANSACTION_STATUS_TRANSITION_INVALID =
            "Không thể chuyển trạng thái giao dịch theo yêu cầu này.";

    /** Lý do hệ thống khi job định kỳ hủy yêu cầu PENDING quá hạn */
    public static final String TRANSACTION_EXPIRED_PENDING_SYSTEM =
            "Hết hạn tự động: người bán không phản hồi trong thời gian cho phép.";

    /** Lý do hệ thống khi job định kỳ hủy ACCEPTED/MEETING quá hạn */
    public static final String TRANSACTION_EXPIRED_ACCEPTED_SYSTEM =
            "Hết hạn tự động: giao dịch chưa hoàn tất (OTP) trong thời gian cho phép.";

    public static final String BOOK_WANTED_CANNOT_CONTACT_SELF =
            "Bạn không thể tự liên hệ với chính tin tìm sách của mình.";
    public static final String BOOK_WANTED_POST_NOT_OPEN = "Tin tìm sách không còn mở để liên hệ.";
    public static final String BOOK_WANTED_INQUIRY_NOT_FOUND = "Không tìm thấy cuộc trao đổi tìm sách.";
    public static final String BOOK_WANTED_INQUIRY_NOT_PARTICIPANT =
            "Chỉ người đăng tin hoặc người liên hệ mới xem được tin nhắn này.";

    public static final String ADMIN_CANNOT_DEMOTE_SELF =
            "Không thể tự bỏ quyền quản trị của chính mình.";
    public static final String ADMIN_USERNAME_TAKEN = "Tên người dùng đã được sử dụng.";

    public static final String REVIEW_TRANSACTION_REQUIRED = "Đánh giá phải gắn với một giao dịch.";
    public static final String REVIEW_TRANSACTION_NOT_COMPLETED = "Chỉ có thể đánh giá giao dịch đã hoàn tất.";
    public static final String REVIEW_NOT_ALLOWED = "Bạn không có quyền đánh giá giao dịch này.";
    public static final String REVIEW_TARGET_INVALID = "Người được đánh giá không khớp với giao dịch.";
    public static final String REVIEW_PRODUCT_INVALID = "Sản phẩm được đánh giá không khớp với giao dịch.";
    public static final String REVIEW_ALREADY_EXISTS = "Bạn đã đánh giá người dùng này trong giao dịch này.";
}
