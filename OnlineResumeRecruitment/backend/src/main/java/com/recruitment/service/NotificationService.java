package com.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.recruitment.common.PageResult;
import com.recruitment.entity.Notification;
import com.recruitment.entity.User;
import com.recruitment.enums.NotificationTypeEnum;
import com.recruitment.exception.BusinessException;
import com.recruitment.mapper.NotificationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationMapper notificationMapper;

    @Autowired
    private UserService userService;

    @Transactional(rollbackFor = Exception.class)
    public Notification createNotification(Long receiverId, Long senderId, NotificationTypeEnum type,
                                           String title, String content, String relatedType, Long relatedId) {
        Notification notification = new Notification();
        notification.setReceiverId(receiverId);
        notification.setSenderId(senderId);
        notification.setType(type.name());
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedType(relatedType);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0);
        notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insert(notification);
        return notification;
    }

    public PageResult<Notification> getMyNotifications(Integer pageNum, Integer pageSize, String type) {
        User currentUser = userService.getCurrentUser();
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getReceiverId, currentUser.getId());
        if (type != null && !type.isEmpty()) {
            wrapper.eq(Notification::getType, type);
        }
        wrapper.orderByDesc(Notification::getCreatedAt);

        Page<Notification> page = new Page<>(pageNum, pageSize);
        notificationMapper.selectPage(page, wrapper);
        return PageResult.of(page.getTotal(), page.getRecords(), pageNum, pageSize);
    }

    @Transactional(rollbackFor = Exception.class)
    public void markAsRead(Long id) {
        User currentUser = userService.getCurrentUser();
        Notification notification = notificationMapper.selectById(id);
        if (notification == null) {
            throw new BusinessException("通知不存在");
        }
        if (!notification.getReceiverId().equals(currentUser.getId())) {
            throw new BusinessException("无权限标记此通知");
        }
        if (notification.getIsRead() == 0) {
            notification.setIsRead(1);
            notification.setReadAt(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void markAllAsRead() {
        User currentUser = userService.getCurrentUser();
        List<Notification> notifications = notificationMapper.selectList(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getReceiverId, currentUser.getId())
                .eq(Notification::getIsRead, 0)
        );
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : notifications) {
            notification.setIsRead(1);
            notification.setReadAt(now);
            notificationMapper.updateById(notification);
        }
    }

    @Async
    @Transactional(rollbackFor = Exception.class)
    public void sendNotificationAsync(Long receiverId, Long senderId, NotificationTypeEnum type,
                                      String title, String content, String relatedType, Long relatedId) {
        createNotification(receiverId, senderId, type, title, content, relatedType, relatedId);
    }

    public Integer countUnread() {
        User currentUser = userService.getCurrentUser();
        Long count = notificationMapper.selectCount(
            new LambdaQueryWrapper<Notification>()
                .eq(Notification::getReceiverId, currentUser.getId())
                .eq(Notification::getIsRead, 0)
        );
        return count != null ? count.intValue() : 0;
    }
}
