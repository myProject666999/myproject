package com.health.physical.controller;

import com.health.physical.common.Result;
import com.health.physical.service.ExamIndicatorService;
import com.health.physical.vo.IndicatorTrendVO;
import com.health.physical.vo.YearCompareVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/indicator")
public class ExamIndicatorController {

    @Autowired
    private ExamIndicatorService examIndicatorService;

    @GetMapping("/trend")
    public Result<IndicatorTrendVO> getIndicatorTrend(@RequestParam Long userId, @RequestParam String indicatorName) {
        return Result.success(examIndicatorService.getIndicatorTrend(userId, indicatorName));
    }

    @GetMapping("/names")
    public Result<List<String>> getDistinctIndicatorNames(@RequestParam Long userId) {
        return Result.success(examIndicatorService.getDistinctIndicatorNames(userId));
    }

    @GetMapping("/compare")
    public Result<List<YearCompareVO>> getYearCompare(@RequestParam Long userId,
                                                  @RequestParam Integer currentYear,
                                                  @RequestParam Integer previousYear) {
        return Result.success(examIndicatorService.getYearCompare(userId, currentYear, previousYear));
    }
}
