package com.educycle.shared.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Gửi email qua SMTP khi {@link JavaMailSender} có bean (cấu hình spring.mail.*).
 * Không ghi log nội dung mail (OTP/token) — chỉ to, subject, outcome.
 */
@Slf4j
@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String mailFrom;

    public MailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail-from:EduCycle}") String mailFrom) {
        this.mailSenderProvider = mailSenderProvider;
        this.mailFrom = mailFrom;
    }

    /**
     * @return {@code true} nếu mail đã gửi qua SMTP thành công; {@code false} nếu không gửi được (dev hoặc lỗi).
     */
    public boolean sendPlain(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn(
                    "[EduCycle — chưa cấu hình SMTP] Email không gửi. outcome={}, to={}, subject={}. "
                            + "Để gửi email thật: profile `smtp` + MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD "
                            + "(xem application-smtp.yml).",
                    MailSendOutcome.SMTP_NOT_CONFIGURED, to, subject);
            logMaskedBodyDebug(body);
            return false;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.debug("Đã gửi mail. outcome={}, to={}, subject={}", MailSendOutcome.SENT, to, subject);
            return true;
        } catch (Exception e) {
            log.error(
                    "Gửi mail thất bại. outcome={}, to={}, subject={}, error={}",
                    MailSendOutcome.SEND_FAILED, to, subject, e.getMessage());
            logMaskedBodyDebug(body);
            return false;
        }
    }

    /** Không bao giờ log plaintext OTP/token — chỉ preview đã mask ở DEBUG. */
    private static void logMaskedBodyDebug(String body) {
        if (!log.isDebugEnabled() || body == null) {
            return;
        }
        log.debug("mail body (masked preview): {}", maskSensitiveBody(body));
    }

    private static String maskSensitiveBody(String body) {
        int len = body.length();
        if (len <= 24) {
            return "***";
        }
        return body.substring(0, 12) + "...*** (" + len + " chars)";
    }
}
