package com.project.cost.controller;

import com.project.cost.common.Result;
import com.project.cost.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/report")
@CrossOrigin
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/project-cost/{projectId}")
    public Result<List<Map<String, Object>>> generateProjectCostReport(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(reportService.generateProjectCostReport(projectId, startDate, endDate));
    }

    @GetMapping("/project-cost/{projectId}/export")
    public ResponseEntity<byte[]> exportProjectCostExcel(
            @PathVariable Long projectId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) throws IOException {
        byte[] excelData = reportService.exportProjectCostExcel(projectId, startDate, endDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "project_cost_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }

    @GetMapping("/utilization")
    public Result<List<Map<String, Object>>> generateUtilizationReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(reportService.generateUtilizationReport(startDate, endDate));
    }
}
