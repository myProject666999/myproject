package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.PageResult;
import com.notification.common.Result;
import com.notification.entity.*;
import com.notification.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class AnnouncementService extends ServiceImpl<AnnouncementMapper, Announcement> {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private AnnouncementReadMapper readMapper;

    @Autowired
    private AttachmentMapper attachmentMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private DepartmentMapper departmentMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public PageResult<Announcement> getList(Integer pageNum, Integer pageSize, Long categoryId,
                                            Integer type, Integer priority, String keyword,
                                            Long userId, Long departmentId) {
        Page<Announcement> page = new Page<>(pageNum, pageSize);

        IPage<Announcement> resultPage = this.baseMapper.selectAnnouncementPage(page, 
                userId != null ? userId : 0L, 
                departmentId, 
                categoryId, 
                type, 
                priority, 
                keyword);
        return new PageResult<>(resultPage.getRecords(), resultPage.getTotal(), pageNum.longValue(), pageSize.longValue());
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Announcement> getDetail(Long id, Long userId) {
        Announcement announcement = this.getById(id);
        if (announcement == null) {
            return Result.error("公告不存在");
        }

        if (userId != null) {
            boolean hasRead = readMapper.selectCount(new LambdaQueryWrapper<AnnouncementRead>()
                    .eq(AnnouncementRead::getAnnouncementId, id)
                    .eq(AnnouncementRead::getUserId, userId)) > 0;

            if (!hasRead) {
                User user = userMapper.selectById(userId);
                if (user != null) {
                    AnnouncementRead read = new AnnouncementRead();
                    read.setAnnouncementId(id);
                    read.setUserId(userId);
                    read.setUserName(user.getRealName());
                    read.setDepartmentId(user.getDepartmentId());
                    readMapper.insert(read);

                    announcement.setReadCount(announcement.getReadCount() + 1);
                    this.updateById(announcement);

                    updateUnreadCountInRedis(user.getId(), user.getDepartmentId());
                }
            }
            announcement.setIsRead(1);
        }

        List<Attachment> attachments = attachmentMapper.selectList(new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getAnnouncementId, id));
        announcement.setCategoryName(getCategoryName(announcement.getCategoryId()));
        announcement.setDepartmentName(getDepartmentName(announcement.getDepartmentId()));

        return Result.success(announcement);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Announcement> publish(Announcement announcement, Long publisherId) {
        if (publisherId == null) {
            return Result.error("用户未登录");
        }
        User publisher = userMapper.selectById(publisherId);
        if (publisher == null) {
            return Result.error("用户不存在");
        }
        announcement.setPublisherId(publisherId);
        announcement.setPublisherName(publisher.getRealName());
        announcement.setDepartmentId(publisher.getDepartmentId());
        announcement.setPublishTime(LocalDateTime.now());
        announcement.setReadCount(0);
        if (announcement.getStatus() == null) {
            announcement.setStatus(1);
        }
        if (announcement.getType() == null) {
            announcement.setType(1);
        }
        if (announcement.getPriority() == null) {
            announcement.setPriority(0);
        }
        if (announcement.getIsAllDepartments() == null) {
            announcement.setIsAllDepartments(1);
        }

        int totalCount = calculateTargetCount(announcement);
        announcement.setTotalCount(totalCount);

        this.save(announcement);
        clearUnreadCountCache();

        return Result.success("发布成功", announcement);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<?> delete(Long id) {
        this.removeById(id);
        attachmentMapper.delete(new LambdaQueryWrapper<Attachment>().eq(Attachment::getAnnouncementId, id));
        readMapper.delete(new LambdaQueryWrapper<AnnouncementRead>().eq(AnnouncementRead::getAnnouncementId, id));
        commentMapper.delete(new LambdaQueryWrapper<Comment>().eq(Comment::getAnnouncementId, id));
        clearUnreadCountCache();
        return Result.success("删除成功");
    }

    public Result<?> updatePriority(Long id, Integer priority) {
        Announcement announcement = new Announcement();
        announcement.setId(id);
        announcement.setPriority(priority);
        this.updateById(announcement);
        return Result.success("更新成功");
    }

    public Integer getUnreadCount(Long userId, Long departmentId) {
        if (userId == null) {
            return 0;
        }
        String key = "unread:" + userId;
        try {
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached != null) {
                return (Integer) cached;
            }
        } catch (Exception ignored) {
        }

        int count = calculateUnreadCount(userId, departmentId);
        try {
            redisTemplate.opsForValue().set(key, count, 1, TimeUnit.HOURS);
        } catch (Exception ignored) {
        }
        return count;
    }

    private int calculateUnreadCount(Long userId, Long departmentId) {
        if (userId == null) {
            return 0;
        }
        Integer countAll = this.baseMapper.countUnreadAll(userId);
        Integer countDept = 0;
        if (departmentId != null) {
            countDept = this.baseMapper.countUnreadByDepartment(userId, departmentId);
        }
        return (countAll != null ? countAll : 0) + (countDept != null ? countDept : 0);
    }

    private void updateUnreadCountInRedis(Long userId, Long departmentId) {
        if (userId == null) {
            return;
        }
        String key = "unread:" + userId;
        int count = calculateUnreadCount(userId, departmentId);
        try {
            redisTemplate.opsForValue().set(key, count, 1, TimeUnit.HOURS);
        } catch (Exception ignored) {
        }
    }

    private void clearUnreadCountCache() {
        try {
            redisTemplate.delete(redisTemplate.keys("unread:*"));
        } catch (Exception ignored) {
        }
    }

    private int calculateTargetCount(Announcement announcement) {
        if (announcement.getIsAllDepartments() != null && announcement.getIsAllDepartments() == 1) {
            return userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getStatus, 1)).intValue();
        }
        if (announcement.getTargetDepartments() != null && !announcement.getTargetDepartments().isEmpty()) {
            try {
                List<Long> deptIds = Arrays.stream(announcement.getTargetDepartments().split(","))
                        .map(Long::parseLong)
                        .collect(Collectors.toList());
                return userMapper.selectCount(new LambdaQueryWrapper<User>()
                        .eq(User::getStatus, 1)
                        .in(User::getDepartmentId, deptIds)).intValue();
            } catch (Exception e) {
                return 0;
            }
        }
        return 0;
    }

    private String getCategoryName(Long categoryId) {
        if (categoryId == null) return "";
        Category category = categoryMapper.selectById(categoryId);
        return category != null ? category.getName() : "";
    }

    private String getDepartmentName(Long departmentId) {
        if (departmentId == null) return "";
        Department dept = departmentMapper.selectById(departmentId);
        return dept != null ? dept.getName() : "";
    }
}
