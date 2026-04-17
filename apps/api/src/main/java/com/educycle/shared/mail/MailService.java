package com.educycle.shared.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Gửi email qua SMTP khi {@link JavaMailSender} có bean (cấu hình spring.mail.*).
 * Nếu không cấu hình SMTP — {@link #sendPlain} trả về {@code false} và ghi WARN kèm nội dung (dev).
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
     * @return {@code true} nếu mail đã gửi qua SMTP thành công; {@code false} nếu chỉ log console (dev) hoặc lỗi gửi.
     */
    public boolean sendPlain(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn(
                    "[EduCycle — chưa cấu hình SMTP] OTP/link chỉ có trên console này. "
                            + "Để gửi email thật: thêm profile `smtp` và biến MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD "
                            + "(xem application-smtp.yml).\nTo: {}\nSubject: {}\n---\n{}\n---",
                    to, subject, body);
            return false;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.debug("Đã gửi mail tới {}", to);
            return true;
        } catch (Exception e) {
            log.error("Gửi mail thất bại tới {}: {}", to, e.getMessage());
            log.warn(
                    "[EduCycle — SMTP lỗi, nội dung mail dự phòng trên console]\nTo: {}\nSubject: {}\n---\n{}\n---",
                    to, subject, body);
            return false;
        }
    }
}
