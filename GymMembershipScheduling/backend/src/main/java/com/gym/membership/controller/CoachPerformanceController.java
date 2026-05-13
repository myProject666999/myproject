package com.gym.membership.controller;

import com.gym.membership.common.Result;
import com.gym.membership.entity.CoachPerformance;
import com.gym.membership.entity.CommissionRule;
import com.gym.membership.service.CoachPerformanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class CoachPerformanceController {

    private final CoachPerformanceService performanceService;

    public CoachPerformanceController(CoachPerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<List<CoachPerformance>> getPerformanceList(
            @RequestParam(required = false) Long coachId,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<CoachPerformance> list = performanceService.getPerformanceList(coachId, startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/commission-rules")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<List<CommissionRule>> getCommissionRules() {
        List<CommissionRule> rules = performanceService.getCommissionRules();
        return Result.success(rules);
    }

    @PutMapping("/commission-rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> updateCommissionRule(@PathVariable Long id, @RequestBody CommissionRule rule) {
        rule.setId(id);
        performanceService.updateCommissionRule(rule);
        return Result.success("更新成功", null);
    }
}
