package com.educycle.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Gửi email qua SMTP khi {@link JavaMailSender} có bean (cấu hình spring.mail.*).
 * Nếu không cấu hình — chỉ log nội dung (dev).
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

    public void sendPlain(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.info("[Mail chưa cấu hình SMTP] To: {}\nSubject: {}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailFrom);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.debug("Đã gửi mail tới {}", to);
        } catch (Exception e) {
            log.error("Gửi mail thất bại tới {}: {}", to, e.getMessage());
            log.info("[Fallback log] To: {}\nSubject: {}\n{}", to, subject, body);
        }
    }
}
