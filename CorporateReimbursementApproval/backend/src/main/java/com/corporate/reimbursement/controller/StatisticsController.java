package com.corporate.reimbursement.controller;

import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    private Long getCurrentUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        return userIdStr != null ? Long.parseLong(userIdStr) : 1L;
    }

    @GetMapping("/personal")
    public Result<Map<String, Object>> personal(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        Map<String, Object> data = statisticsService.getPersonalStats(userId);
        return Result.success(data);
    }

    @GetMapping("/department")
    public Result<Map<String, Object>> department(@RequestParam(required = false) Long deptId) {
        Map<String, Object> data = statisticsService.getDepartmentStats(deptId);
        return Result.success(data);
    }

    @GetMapping("/monthly/{year}")
    public Result<List<Map<String, Object>>> monthly(@PathVariable int year) {
        List<Map<String, Object>> data = statisticsService.getMonthlyStats(year);
        return Result.success(data);
    }
}