package com.project.cost.controller;

import com.project.cost.common.Result;
import com.project.cost.service.CostAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analysis")
@CrossOrigin
public class CostAnalysisController {

    @Autowired
    private CostAnalysisService costAnalysisService;

    @GetMapping("/project/{projectId}")
    public Result<Map<String, Object>> getProjectCostSummary(@PathVariable Long projectId) {
        try {
            return Result.success(costAnalysisService.getProjectCostSummary(projectId));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/utilization/user/{userId}")
    public Result<Map<String, Object>> getUserUtilization(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAnalysisService.getUserUtilization(userId, startDate, endDate));
    }

    @GetMapping("/utilization/dept/{deptId}")
    public Result<Map<String, Object>> getDeptUtilization(
            @PathVariable Long deptId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(costAnalysisService.getDeptUtilization(deptId, startDate, endDate));
    }

    @GetMapping("/trend/{projectId}")
    public Result<List<Map<String, Object>>> getMonthlyTrend(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "6") int months) {
        return Result.success(costAnalysisService.getMonthlyTrend(projectId, months));
    }
}
