package com.educycle.notification.application;

import com.educycle.notification.dto.NotificationResponse;
import com.educycle.notification.domain.Notification;
import com.educycle.user.domain.User;
import com.educycle.notification.persistence.NotificationRepository;
import com.educycle.user.persistence.UserRepository;
import com.educycle.notification.application.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectProvider<SimpMessagingTemplate> messagingTemplate;

    @Override
    public void create(UUID userId, String type, String title, String message, UUID relatedId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Skip notification: user {} not found", userId);
            return;
        }
        if (!shouldNotify(user, type)) {
            log.debug("Skip notification type={} for user {} (preferences)", type, userId);
            return;
        }

        Notification n = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .build();

        notificationRepository.save(n);

        NotificationResponse dto = mapToResponse(n);
        messagingTemplate.ifAvailable(template ->
                template.convertAndSendToUser(
                        userId.toString(),
                        "/queue/notifications",
                        dto
                ));
        log.debug("Notification sent: type={} userId={}", type, userId);
    }

    private static boolean shouldNotify(User user, String type) {
        if (type == null) {
            return true;
        }
        return switch (type) {
            case "PRODUCT_APPROVED", "PRODUCT_REJECTED" -> user.isNotifyProductModeration();
            case "NEW_MESSAGE", "BOOK_WANTED_INQUIRY" -> user.isNotifyMessages();
            default -> user.isNotifyTransactions();
        };
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecent(UUID userId) {
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    @Override
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(),
                n.getMessage(), n.getRelatedId(), n.isRead(), n.getCreatedAt()
        );
    }
}
