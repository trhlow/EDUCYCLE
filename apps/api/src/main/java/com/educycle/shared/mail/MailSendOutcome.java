package com.educycle.shared.mail;

/**
 * Trạng thái gửi mail — log được an toàn (không chứa nội dung nhạy cảm).
 */
public enum MailSendOutcome {
    /** Đã gửi qua SMTP thành công */
    SENT,
    /** Không có bean SMTP — mail không gửi (dev) */
    SMTP_NOT_CONFIGURED,
    /** SMTP lỗi — mail không gửi */
    SEND_FAILED
}
