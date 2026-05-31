package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.Result;
import com.smartdoor.entity.Notification;

public interface NotificationService extends IService<Notification> {
    Result<Void> sendNotification(String userType, Long userId, String userName, String userPhone,
                                   String notificationType, String title, String content,
                                   String channel, String relatedType, Long relatedId);
    Result<Void> markAsRead(Long id);
    Result<Void> markAllAsRead(Long userId);
}
