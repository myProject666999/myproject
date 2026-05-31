package com.smartdoor.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartdoor.common.Result;
import com.smartdoor.entity.Notification;
import com.smartdoor.mapper.NotificationMapper;
import com.smartdoor.service.NotificationService;
import com.smartdoor.utils.PasswordGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification> implements NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public Result<Void> sendNotification(String userType, Long userId, String userName, String userPhone,
                                          String notificationType, String title, String content,
                                          String channel, String relatedType, Long relatedId) {
        try {
            Notification notification = new Notification();
            notification.setNotificationNo(PasswordGenerator.generateRecordNo());
            notification.setUserType(userType);
            notification.setUserId(userId);
            notification.setUserName(userName);
            notification.setUserPhone(userPhone);
            notification.setNotificationType(notificationType);
            notification.setTitle(title);
            notification.setContent(content);
            notification.setChannel(StringUtils.hasText(channel) ? channel : "SYSTEM");
            notification.setRelatedType(relatedType);
            notification.setRelatedId(relatedId);
            notification.setSendStatus("SUCCESS");
            notification.setSendTime(LocalDateTime.now());
            notification.setReadStatus(0);

            this.save(notification);

            log.info("发送通知成功: user={}, type={}, title={}", userName, notificationType, title);
            return Result.success();
        } catch (Exception e) {
            log.error("发送通知失败", e);
            return Result.error("发送通知失败: " + e.getMessage());
        }
    }

    @Override
    public Result<Void> markAsRead(Long id) {
        Notification notification = this.getById(id);
        if (notification == null) {
            return Result.error("通知不存在");
        }

        if (notification.getReadStatus() == 0) {
            notification.setReadStatus(1);
            notification.setReadTime(LocalDateTime.now());
            this.updateById(notification);
        }

        return Result.success();
    }

    @Override
    public Result<Void> markAllAsRead(Long userId) {
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getUserId, userId)
                .eq(Notification::getReadStatus, 0);

        this.list(wrapper).forEach(notification -> {
            notification.setReadStatus(1);
            notification.setReadTime(LocalDateTime.now());
            this.updateById(notification);
        });

        return Result.success();
    }
}
