package com.onsiterepair.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.onsiterepair.entity.Notification;
import com.onsiterepair.mapper.NotificationMapper;
import com.onsiterepair.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {

    @Override
    public void createNotification(Integer userType, Long userId, String type, String title, String content, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserType(userType);
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0);
        save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Integer userType, Long userId) {
        return list(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserType, userType)
                .eq(Notification::getUserId, userId)
                .orderByDesc(Notification::getCreateTime));
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = getById(notificationId);
        if (notification != null) {
            notification.setIsRead(1);
            updateById(notification);
        }
    }

    @Override
    public int getUnreadCount(Integer userType, Long userId) {
        return (int) count(new LambdaQueryWrapper<Notification>()
                .eq(Notification::getUserType, userType)
                .eq(Notification::getUserId, userId)
                .eq(Notification::getIsRead, 0));
    }
}
