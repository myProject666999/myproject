package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.YearlyReportDTO;
import com.booklist.service.YearlyReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/yearly-report")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class YearlyReportController {

    private final YearlyReportService yearlyReportService;

    @GetMapping
    public Result<YearlyReportDTO> getCurrentYearReport() {
        int currentYear = LocalDate.now().getYear();
        return Result.success(yearlyReportService.generateYearlyReport(currentYear));
    }

    @GetMapping("/{year}")
    public Result<YearlyReportDTO> getYearlyReport(@PathVariable int year) {
        return Result.success(yearlyReportService.generateYearlyReport(year));
    }
}
