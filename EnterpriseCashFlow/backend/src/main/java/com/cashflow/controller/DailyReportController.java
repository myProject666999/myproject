package com.cashflow.controller;

import com.cashflow.common.Result;
import com.cashflow.entity.DailyReport;
import com.cashflow.service.DailyReportService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/daily-reports")
public class DailyReportController {

    private final DailyReportService dailyReportService;

    public DailyReportController(DailyReportService dailyReportService) {
        this.dailyReportService = dailyReportService;
    }

    @GetMapping("/{companyId}")
    public Result<DailyReport> getByDate(@PathVariable Long companyId,
                                         @RequestParam String date) {
        LocalDate reportDate = LocalDate.parse(date);
        return Result.success(dailyReportService.getByReportDate(companyId, reportDate));
    }

    @PostMapping("/generate/{companyId}")
    public Result<DailyReport> generate(@PathVariable Long companyId,
                                        @RequestParam String date) {
        LocalDate reportDate = LocalDate.parse(date);
        return Result.success(dailyReportService.generateDailyReport(companyId, reportDate));
    }
}
