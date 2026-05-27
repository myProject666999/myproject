package com.notification.controller;

import com.notification.common.Result;
import com.notification.service.StatisticsService;
import com.notification.utils.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/announcement/{announcementId}")
    public Result<Map<String, Object>> getReadStatistics(@PathVariable Long announcementId) {
        return Result.success(statisticsService.getReadStatistics(announcementId));
    }

    @GetMapping("/my-stats")
    public Result<Map<String, Object>> getMyStats() {
        Long userId = UserContext.getUserId();
        return statisticsService.getUserReadStats(userId);
    }
}
