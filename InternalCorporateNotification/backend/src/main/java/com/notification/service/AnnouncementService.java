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

        LambdaQueryWrapper<Announcement> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Announcement::getStatus, 1);

        if (categoryId != null) {
            wrapper.eq(Announcement::getCategoryId, categoryId);
        }
        if (type != null) {
            wrapper.eq(Announcement::getType, type);
        }
        if (priority != null) {
            wrapper.eq(Announcement::getPriority, priority);
        }
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Announcement::getTitle, keyword);
        }

        wrapper.and(w -> w.eq(Announcement::getIsAllDepartments, 1)
                .or(i -> i.apply("FIND_IN_SET({0}, target_departments)", departmentId)));

        IPage<Announcement> resultPage = this.baseMapper.selectAnnouncementPage(page, wrapper, userId);
        return new PageResult<>(resultPage.getRecords(), resultPage.getTotal(), pageNum.longValue(), pageSize.longValue());
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Announcement> getDetail(Long id, Long userId) {
        Announcement announcement = this.getById(id);
        if (announcement == null) {
            return Result.error("公告不存在");
        }

        boolean hasRead = readMapper.selectCount(new LambdaQueryWrapper<AnnouncementRead>()
                .eq(AnnouncementRead::getAnnouncementId, id)
                .eq(AnnouncementRead::getUserId, userId)) > 0;

        if (!hasRead) {
            User user = userMapper.selectById(userId);
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

        List<Attachment> attachments = attachmentMapper.selectList(new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getAnnouncementId, id));
        announcement.setCategoryName(getCategoryName(announcement.getCategoryId()));
        announcement.setDepartmentName(getDepartmentName(announcement.getDepartmentId()));
        announcement.setIsRead(1);

        return Result.success(announcement);
    }

    @Transactional(rollbackFor = Exception.class)
    public Result<Announcement> publish(Announcement announcement, Long publisherId) {
        User publisher = userMapper.selectById(publisherId);
        announcement.setPublisherId(publisherId);
        announcement.setPublisherName(publisher.getRealName());
        announcement.setDepartmentId(publisher.getDepartmentId());
        announcement.setPublishTime(LocalDateTime.now());
        announcement.setReadCount(0);

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
        String key = "unread:" + userId;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            return (Integer) cached;
        }

        int count = calculateUnreadCount(userId, departmentId);
        redisTemplate.opsForValue().set(key, count, 1, TimeUnit.HOURS);
        return count;
    }

    private int calculateUnreadCount(Long userId, Long departmentId) {
        Integer countAll = this.baseMapper.countUnreadAll(userId);
        Integer countDept = this.baseMapper.countUnreadByDepartment(userId, departmentId);
        return (countAll != null ? countAll : 0) + (countDept != null ? countDept : 0);
    }

    private void updateUnreadCountInRedis(Long userId, Long departmentId) {
        String key = "unread:" + userId;
        int count = calculateUnreadCount(userId, departmentId);
        redisTemplate.opsForValue().set(key, count, 1, TimeUnit.HOURS);
    }

    private void clearUnreadCountCache() {
        try {
            redisTemplate.delete(redisTemplate.keys("unread:*"));
        } catch (Exception ignored) {
        }
    }

    private int calculateTargetCount(Announcement announcement) {
        if (announcement.getIsAllDepartments() == 1) {
            return userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getStatus, 1)).intValue();
        }
        if (announcement.getTargetDepartments() != null && !announcement.getTargetDepartments().isEmpty()) {
            List<Long> deptIds = Arrays.stream(announcement.getTargetDepartments().split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            return userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getStatus, 1)
                    .in(User::getDepartmentId, deptIds)).intValue();
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
