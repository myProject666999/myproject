package com.creator.platform.controller;

import com.creator.platform.common.Result;
import com.creator.platform.enums.ReportTypeEnum;
import com.creator.platform.service.WeeklyReportService;
import com.creator.platform.vo.WeeklyReportVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/weekly-report")
@RequiredArgsConstructor
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    @GetMapping("/detail")
    public Result<WeeklyReportVO> getWeeklyReport(
            @RequestParam Long creatorId,
            @RequestParam(defaultValue = "ALL") String reportType,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate weekDate) {
        return Result.success(weeklyReportService.getWeeklyReport(creatorId, reportType, weekDate));
    }

    @PostMapping("/generate")
    public Result<WeeklyReportVO> generateWeeklyReport(
            @RequestParam Long creatorId,
            @RequestParam(defaultValue = "ALL") String reportType,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate weekStart,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate weekEnd) {
        return Result.success(weeklyReportService.generateWeeklyReport(creatorId, reportType, weekStart, weekEnd));
    }

    @GetMapping("/list")
    public Result<List<WeeklyReportVO>> getReportList(
            @RequestParam Long creatorId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(weeklyReportService.getReportList(creatorId, pageNum, pageSize));
    }

    @GetMapping("/report-types")
    public Result<ReportTypeEnum[]> getReportTypes() {
        return Result.success(ReportTypeEnum.values());
    }

    @GetMapping("/refresh")
    public Result<Void> refreshCache(@RequestParam Long creatorId) {
        weeklyReportService.evictCache(creatorId);
        return Result.success();
    }
}
