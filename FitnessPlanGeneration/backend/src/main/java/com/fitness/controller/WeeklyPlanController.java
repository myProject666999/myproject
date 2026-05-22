package com.fitness.controller;

import com.fitness.common.Result;
import com.fitness.service.WeeklyPlanService;
import com.fitness.vo.WeeklyPlanVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weekly-plan")
public class WeeklyPlanController {

    @Autowired
    private WeeklyPlanService weeklyPlanService;

    @GetMapping("/current/{userId}")
    public Result<WeeklyPlanVO> getCurrentWeeklyPlan(@PathVariable Long userId) {
        WeeklyPlanVO vo = weeklyPlanService.getCurrentWeeklyPlan(userId);
        if (vo == null) {
            return Result.error("当前周暂无计划，请先填写问卷并生成计划");
        }
        return Result.success(vo);
    }

    @GetMapping("/{id}")
    public Result<WeeklyPlanVO> getWeeklyPlanById(@PathVariable Long id) {
        WeeklyPlanVO vo = weeklyPlanService.getWeeklyPlanById(id);
        if (vo == null) {
            return Result.error("周计划不存在");
        }
        return Result.success(vo);
    }
}
