package com.carbon.emission.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.carbon.emission.common.Result;
import com.carbon.emission.entity.Report;
import com.carbon.emission.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/generate")
    public Result<Report> generateReport(
            @RequestParam Long orgId,
            @RequestParam Integer reportType,
            @RequestParam Integer periodType,
            @RequestParam String periodValue,
            @RequestParam String createBy) {
        return Result.success(reportService.generateReport(orgId, reportType, periodType, periodValue, createBy));
    }

    @GetMapping("/page")
    public Result<Page<Report>> getReportPage(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) Integer reportType,
            @RequestParam(required = false) Integer reportStatus,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(reportService.getReportPage(orgId, reportType, reportStatus, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<Report> getById(@PathVariable Long id) {
        return Result.success(reportService.getById(id));
    }

    @PostMapping("/new-version")
    public Result<Report> createNewVersion(
            @RequestParam Long reportId,
            @RequestParam String createBy) {
        return Result.success(reportService.createNewVersion(reportId, createBy));
    }

    @GetMapping("/history/{reportNo}")
    public Result<List<Report>> getReportHistory(@PathVariable String reportNo) {
        return Result.success(reportService.getReportHistory(reportNo));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Report report) {
        return Result.success(reportService.updateById(report));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(reportService.removeById(id));
    }
}
