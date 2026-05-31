package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.DailyReport;
import com.cashflow.service.DailyReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/reports")
@CrossOrigin
public class DailyReportController {

    private final DailyReportService dailyReportService;

    public DailyReportController(DailyReportService dailyReportService) {
        this.dailyReportService = dailyReportService;
    }

    @GetMapping
    public Result<IPage<DailyReport>> list(@RequestParam(defaultValue = "1") int current,
                                           @RequestParam(defaultValue = "10") int size) {
        return Result.success(dailyReportService.getReportList(current, size));
    }

    @GetMapping("/{date}")
    public Result<DailyReport> getByDate(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(dailyReportService.getReportByDate(date));
    }

    @PostMapping("/generate")
    public Result<DailyReport> generate(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate reportDate) {
        return Result.success(dailyReportService.generateDailyReport(reportDate));
    }
}
