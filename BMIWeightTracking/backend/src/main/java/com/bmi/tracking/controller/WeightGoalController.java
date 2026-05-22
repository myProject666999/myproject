package com.bmi.tracking.controller;

import com.bmi.tracking.common.Result;
import com.bmi.tracking.entity.WeightGoal;
import com.bmi.tracking.service.WeightGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/goal")
public class WeightGoalController {

    @Autowired
    private WeightGoalService weightGoalService;

    @PostMapping
    public Result<Void> setGoal(@RequestBody Map<String, Object> body) {
        BigDecimal targetWeight = new BigDecimal(body.get("targetWeight").toString());
        LocalDate targetDate = body.get("targetDate") != null
                ? LocalDate.parse(body.get("targetDate").toString())
                : null;
        weightGoalService.setGoal(targetWeight, targetDate);
        return Result.success();
    }

    @GetMapping
    public Result<WeightGoal> getGoal() {
        return Result.success(weightGoalService.getGoal());
    }

    @GetMapping("/progress")
    public Result<Map<String, Object>> progress() {
        return Result.success(weightGoalService.getGoalProgress());
    }
}
