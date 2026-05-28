package com.project.cost.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.project.cost.entity.*;
import com.project.cost.mapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class CostAnalysisService {

    @Autowired
    private TimesheetMapper timesheetMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private WorkCalendarMapper workCalendarMapper;

    @Autowired
    private ReportCacheMapper reportCacheMapper;

    private static final BigDecimal DAILY_WORK_HOURS = new BigDecimal("8");

    public Map<String, Object> getProjectCostSummary(Long projectId) {
        Project project = projectMapper.selectById(projectId);
        if (project == null) {
            throw new RuntimeException("Project not found");
        }

        List<Timesheet> approvedTimesheets = timesheetMapper.selectList(
                new LambdaQueryWrapper<Timesheet>()
                        .eq(Timesheet::getProjectId, projectId)
                        .eq(Timesheet::getApprovalStatus, 2)
        );

        BigDecimal totalHours = BigDecimal.ZERO;
        int totalCost = 0;

        Map<Long, BigDecimal> userHours = new HashMap<>();
        Map<Long, Integer> userCost = new HashMap<>();

        for (Timesheet ts : approvedTimesheets) {
            int rate = projectService.getUserHourlyRate(projectId, ts.getUserId());
            int cost = ts.getWorkHours().multiply(new BigDecimal(rate)).setScale(0, RoundingMode.HALF_UP).intValue();

            totalHours = totalHours.add(ts.getWorkHours());
            totalCost += cost;

            userHours.merge(ts.getUserId(), ts.getWorkHours(), BigDecimal::add);
            userCost.merge(ts.getUserId(), cost, Integer::sum);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("projectId", projectId);
        result.put("projectName", project.getProjectName());
        result.put("budgetCost", project.getBudgetCost());
        result.put("budgetCostYuan", formatYuan(project.getBudgetCost()));
        result.put("budgetHours", project.getBudgetHours());
        result.put("actualHours", totalHours);
        result.put("actualCost", totalCost);
        result.put("actualCostYuan", formatYuan(totalCost));
        result.put("remainingCost", project.getBudgetCost() - totalCost);
        result.put("remainingCostYuan", formatYuan(project.getBudgetCost() - totalCost));
        result.put("costUsageRate", project.getBudgetCost() > 0
                ? new BigDecimal(totalCost * 100).divide(new BigDecimal(project.getBudgetCost()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        result.put("hoursUsageRate", project.getBudgetHours().compareTo(BigDecimal.ZERO) > 0
                ? totalHours.multiply(new BigDecimal("100")).divide(project.getBudgetHours(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        return result;
    }

    @Cacheable(value = "utilization", key = "#userId + ':' + #startDate + ':' + #endDate")
    public Map<String, Object> getUserUtilization(Long userId, LocalDate startDate, LocalDate endDate) {
        Long workDays = workCalendarMapper.countWorkDays(startDate, endDate);
        BigDecimal requiredHours = new BigDecimal(workDays).multiply(DAILY_WORK_HOURS);

        List<Timesheet> timesheets = timesheetMapper.selectList(
                new LambdaQueryWrapper<Timesheet>()
                        .eq(Timesheet::getUserId, userId)
                        .eq(Timesheet::getApprovalStatus, 2)
                        .between(Timesheet::getWorkDate, startDate, endDate)
        );

        BigDecimal actualHours = timesheets.stream()
                .map(Timesheet::getWorkHours)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal utilizationRate = requiredHours.compareTo(BigDecimal.ZERO) > 0
                ? actualHours.multiply(new BigDecimal("100")).divide(requiredHours, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("workDays", workDays);
        result.put("requiredHours", requiredHours);
        result.put("actualHours", actualHours);
        result.put("utilizationRate", utilizationRate);

        return result;
    }

    @Cacheable(value = "deptUtilization", key = "#deptId + ':' + #startDate + ':' + #endDate")
    public Map<String, Object> getDeptUtilization(Long deptId, LocalDate startDate, LocalDate endDate) {
        Long workDays = workCalendarMapper.countWorkDays(startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("deptId", deptId);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("workDays", workDays);

        return result;
    }

    public List<Map<String, Object>> getMonthlyTrend(Long projectId, int months) {
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            YearMonth yearMonth = YearMonth.from(today.minusMonths(i));
            LocalDate start = yearMonth.atDay(1);
            LocalDate end = yearMonth.atEndOfMonth();

            List<Timesheet> timesheets = timesheetMapper.selectList(
                    new LambdaQueryWrapper<Timesheet>()
                            .eq(Timesheet::getProjectId, projectId)
                            .eq(Timesheet::getApprovalStatus, 2)
                            .between(Timesheet::getWorkDate, start, end)
            );

            BigDecimal hours = timesheets.stream()
                    .map(Timesheet::getWorkHours)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            int cost = 0;
            for (Timesheet ts : timesheets) {
                int rate = projectService.getUserHourlyRate(projectId, ts.getUserId());
                cost += ts.getWorkHours().multiply(new BigDecimal(rate)).intValue();
            }

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", yearMonth.toString());
            monthData.put("hours", hours);
            monthData.put("cost", cost);
            monthData.put("costYuan", formatYuan(cost));
            trend.add(monthData);
        }

        return trend;
    }

    private String formatYuan(Integer cents) {
        if (cents == null) return "0.00";
        return new BigDecimal(cents).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP).toString();
    }
}
