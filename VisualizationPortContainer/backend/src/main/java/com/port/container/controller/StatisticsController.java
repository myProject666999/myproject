package com.port.container.controller;

import com.port.container.aspect.OperationLog;
import com.port.container.common.R;
import com.port.container.service.StatisticsService;
import com.port.container.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public R<DashboardDataVO> getDashboard() {
        return R.success(statisticsService.getDashboardData());
    }

    @GetMapping("/rehandle-rate")
    public R<List<RehandleRateVO>> getRehandleRate(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return R.success(statisticsService.getRehandleRateAnalysis(startDate, endDate));
    }

    @GetMapping("/throughput")
    public R<List<ThroughputVO>> getThroughput(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String type) {
        return R.success(statisticsService.getThroughputStatistics(startDate, endDate, type));
    }

    @GetMapping("/crane-utilization")
    public R<List<CraneUtilizationVO>> getCraneUtilization(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return R.success(statisticsService.getCraneUtilization(startDate, endDate));
    }

    @GetMapping("/slot-trend")
    public R<List<SlotUtilizationTrendVO>> getSlotTrend(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return R.success(statisticsService.getSlotUtilizationTrend(startDate, endDate));
    }

    @PostMapping("/generate-daily")
    @OperationLog(module = "统计管理", operationType = "生成日报", description = "生成每日统计数据")
    public R<Void> generateDaily(@RequestBody(required = false) Map<String, String> params) {
        LocalDate statDate = null;
        if (params != null && params.get("statDate") != null) {
            statDate = LocalDate.parse(params.get("statDate"));
        }
        boolean result = statisticsService.generateDailyStatistics(statDate != null ? statDate : LocalDate.now());
        return result ? R.success() : R.fail();
    }
}
