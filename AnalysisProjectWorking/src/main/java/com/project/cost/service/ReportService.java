package com.project.cost.service;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.cost.entity.ReportCache;
import com.project.cost.entity.Timesheet;
import com.project.cost.mapper.ReportCacheMapper;
import com.project.cost.mapper.TimesheetMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private TimesheetMapper timesheetMapper;

    @Autowired
    private ReportCacheMapper reportCacheMapper;

    @Autowired
    private ProjectService projectService;

    private static final int CACHE_HOURS = 2;

    public List<Map<String, Object>> generateProjectCostReport(Long projectId, LocalDate startDate, LocalDate endDate) {
        String cacheKey = "project_cost:" + projectId + ":" + startDate + ":" + endDate;
        ReportCache cache = reportCacheMapper.selectOne(
                new LambdaQueryWrapper<ReportCache>().eq(ReportCache::getCacheKey, cacheKey)
        );

        if (cache != null && cache.getExpireTime().isAfter(LocalDateTime.now())) {
            return JSON.parseArray(cache.getCacheData(), Map.class);
        }

        List<Timesheet> timesheets = timesheetMapper.selectList(
                new LambdaQueryWrapper<Timesheet>()
                        .eq(Timesheet::getProjectId, projectId)
                        .eq(Timesheet::getApprovalStatus, 2)
                        .between(Timesheet::getWorkDate, startDate, endDate)
                        .orderByAsc(Timesheet::getWorkDate)
        );

        Map<Long, Map<String, Object>> userSummary = new LinkedHashMap<>();
        for (Timesheet ts : timesheets) {
            Map<String, Object> summary = userSummary.computeIfAbsent(ts.getUserId(), k -> new HashMap<>());
            summary.merge("totalHours", ts.getWorkHours(), (a, b) -> ((BigDecimal) a).add((BigDecimal) b));

            int rate = projectService.getUserHourlyRate(projectId, ts.getUserId());
            int cost = ts.getWorkHours().multiply(new BigDecimal(rate)).setScale(0, RoundingMode.HALF_UP).intValue();
            summary.merge("totalCost", cost, (a, b) -> (Integer) a + (Integer) b);
        }

        List<Map<String, Object>> report = new ArrayList<>();
        for (Map.Entry<Long, Map<String, Object>> entry : userSummary.entrySet()) {
            Map<String, Object> row = new HashMap<>();
            row.put("userId", entry.getKey());
            row.putAll(entry.getValue());
            Integer cost = (Integer) entry.getValue().get("totalCost");
            row.put("totalCostYuan", formatYuan(cost));
            report.add(row);
        }

        saveCache(cacheKey, "project_cost", "user", startDate, endDate, JSON.toJSONString(report));
        return report;
    }

    public byte[] exportProjectCostExcel(Long projectId, LocalDate startDate, LocalDate endDate) throws IOException {
        List<Map<String, Object>> reportData = generateProjectCostReport(projectId, startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Project Cost Report");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"User ID", "Total Hours", "Total Cost (Yuan)"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            int rowNum = 1;
            for (Map<String, Object> row : reportData) {
                Row dataRow = sheet.createRow(rowNum++);
                dataRow.createCell(0).setCellValue(String.valueOf(row.get("userId")));
                dataRow.createCell(1).setCellValue(row.get("totalHours").toString());
                dataRow.createCell(2).setCellValue(String.valueOf(row.get("totalCostYuan")));
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                workbook.write(out);
                return out.toByteArray();
            }
        }
    }

    public List<Map<String, Object>> generateUtilizationReport(LocalDate startDate, LocalDate endDate) {
        String cacheKey = "utilization:" + startDate + ":" + endDate;
        ReportCache cache = reportCacheMapper.selectOne(
                new LambdaQueryWrapper<ReportCache>().eq(ReportCache::getCacheKey, cacheKey)
        );

        if (cache != null && cache.getExpireTime().isAfter(LocalDateTime.now())) {
            return JSON.parseArray(cache.getCacheData(), Map.class);
        }

        List<Timesheet> timesheets = timesheetMapper.selectList(
                new LambdaQueryWrapper<Timesheet>()
                        .eq(Timesheet::getApprovalStatus, 2)
                        .between(Timesheet::getWorkDate, startDate, endDate)
        );

        Map<Long, BigDecimal> userHours = new HashMap<>();
        for (Timesheet ts : timesheets) {
            userHours.merge(ts.getUserId(), ts.getWorkHours(), BigDecimal::add);
        }

        List<Map<String, Object>> report = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : userHours.entrySet()) {
            Map<String, Object> row = new HashMap<>();
            row.put("userId", entry.getKey());
            row.put("totalHours", entry.getValue());
            report.add(row);
        }

        saveCache(cacheKey, "utilization", "summary", startDate, endDate, JSON.toJSONString(report));
        return report;
    }

    private void saveCache(String cacheKey, String cacheType, String dimension,
                           LocalDate startDate, LocalDate endDate, String data) {
        ReportCache cache = new ReportCache();
        cache.setCacheKey(cacheKey);
        cache.setCacheType(cacheType);
        cache.setDimension(dimension);
        cache.setStartDate(startDate);
        cache.setEndDate(endDate);
        cache.setCacheData(data);
        cache.setCreateTime(LocalDateTime.now());
        cache.setExpireTime(LocalDateTime.now().plusHours(CACHE_HOURS));
        reportCacheMapper.insert(cache);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private String formatYuan(Integer cents) {
        if (cents == null) return "0.00";
        return new BigDecimal(cents).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP).toString();
    }
}
