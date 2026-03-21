package com.educycle.service;

import com.educycle.dto.notification.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    void create(UUID userId, String type, String title, String message, UUID relatedId);
    List<NotificationResponse> getRecent(UUID userId);
    long getUnreadCount(UUID userId);
    void markAsRead(UUID notificationId, UUID userId);
    void markAllAsRead(UUID userId);
}
