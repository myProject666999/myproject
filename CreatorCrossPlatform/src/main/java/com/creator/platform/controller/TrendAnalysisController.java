package com.creator.platform.controller;

import com.creator.platform.common.Result;
import com.creator.platform.service.TrendAnalysisService;
import com.creator.platform.vo.TrendDataVO;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trend")
@RequiredArgsConstructor
public class TrendAnalysisController {

    private final TrendAnalysisService trendAnalysisService;

    @GetMapping("/fans")
    public Result<Map<String, List<TrendDataVO>>> getFansTrend(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(trendAnalysisService.getFansTrend(creatorId, platformId, startDate, endDate));
    }

    @GetMapping("/views")
    public Result<Map<String, List<TrendDataVO>>> getViewsTrend(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(trendAnalysisService.getViewsTrend(creatorId, platformId, startDate, endDate));
    }

    @GetMapping("/engagement")
    public Result<Map<String, List<TrendDataVO>>> getEngagementTrend(
            @RequestParam Long creatorId,
            @RequestParam(required = false) Long platformId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(trendAnalysisService.getEngagementTrend(creatorId, platformId, startDate, endDate));
    }

    @GetMapping("/refresh")
    public Result<Void> refreshCache(@RequestParam Long creatorId) {
        trendAnalysisService.evictCache(creatorId);
        return Result.success();
    }
}
