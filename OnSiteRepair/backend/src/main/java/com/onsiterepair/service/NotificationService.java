package com.onsiterepair.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.onsiterepair.entity.Notification;

import java.util.List;

public interface NotificationService extends IService<Notification> {
    void createNotification(Integer userType, Long userId, String type, String title, String content, Long relatedId);
    List<Notification> getUserNotifications(Integer userType, Long userId);
    void markAsRead(Long notificationId);
    int getUnreadCount(Integer userType, Long userId);
}
