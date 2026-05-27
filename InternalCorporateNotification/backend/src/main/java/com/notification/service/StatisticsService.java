package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.Result;
import com.notification.entity.AnnouncementRead;
import com.notification.entity.User;
import com.notification.mapper.AnnouncementReadMapper;
import com.notification.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatisticsService extends ServiceImpl<AnnouncementReadMapper, AnnouncementRead> {

    @Autowired
    private UserMapper userMapper;

    public Map<String, Object> getReadStatistics(Long announcementId) {
        Map<String, Object> result = new HashMap<>();

        Long readCount = this.count(new LambdaQueryWrapper<AnnouncementRead>()
                .eq(AnnouncementRead::getAnnouncementId, announcementId));

        List<AnnouncementRead> readList = this.list(new LambdaQueryWrapper<AnnouncementRead>()
                .eq(AnnouncementRead::getAnnouncementId, announcementId)
                .orderByDesc(AnnouncementRead::getReadTime));

        List<User> allUsers = userMapper.selectList(new LambdaQueryWrapper<User>()
                .eq(User::getStatus, 1));

        Set<Long> readUserIds = readList.stream()
                .map(AnnouncementRead::getUserId)
                .collect(Collectors.toSet());

        List<User> unreadUsers = allUsers.stream()
                .filter(user -> !readUserIds.contains(user.getId()))
                .collect(Collectors.toList());

        result.put("readCount", readCount);
        result.put("totalCount", allUsers.size());
        result.put("readList", readList);
        result.put("unreadList", unreadUsers);
        result.put("readRate", allUsers.size() > 0 ? (int) (readCount * 100 / allUsers.size()) : 0);

        Map<Long, Long> deptReadCount = new HashMap<>();
        Map<Long, Long> deptTotalCount = new HashMap<>();

        for (User user : allUsers) {
            Long deptId = user.getDepartmentId();
            if (deptId != null) {
                deptTotalCount.put(deptId, deptTotalCount.getOrDefault(deptId, 0L) + 1);
                if (readUserIds.contains(user.getId())) {
                    deptReadCount.put(deptId, deptReadCount.getOrDefault(deptId, 0L) + 1);
                }
            }
        }

        List<Map<String, Object>> deptStats = new ArrayList<>();
        for (Map.Entry<Long, Long> entry : deptTotalCount.entrySet()) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("departmentId", entry.getKey());
            stat.put("total", entry.getValue());
            stat.put("read", deptReadCount.getOrDefault(entry.getKey(), 0L));
            stat.put("rate", entry.getValue() > 0 ? (int) (deptReadCount.getOrDefault(entry.getKey(), 0L) * 100 / entry.getValue()) : 0);
            deptStats.add(stat);
        }
        result.put("deptStatistics", deptStats);

        return result;
    }

    public Result<Map<String, Object>> getUserReadStats(Long userId) {
        Map<String, Object> result = new HashMap<>();

        Long totalRead = this.count(new LambdaQueryWrapper<AnnouncementRead>()
                .eq(AnnouncementRead::getUserId, userId));

        List<AnnouncementRead> recentReads = this.list(new LambdaQueryWrapper<AnnouncementRead>()
                .eq(AnnouncementRead::getUserId, userId)
                .orderByDesc(AnnouncementRead::getReadTime)
                .last("LIMIT 10"));

        result.put("totalRead", totalRead);
        result.put("recentReads", recentReads);

        return Result.success(result);
    }
}
