package com.nutrition.controller;

import com.nutrition.common.Result;
import com.nutrition.entity.NutritionGoal;
import com.nutrition.service.NutritionGoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/nutrition-goals")
public class NutritionGoalController {

    @Autowired
    private NutritionGoalService nutritionGoalService;

    @GetMapping("/current")
    public Result<NutritionGoal> getCurrentGoal() {
        return Result.success(nutritionGoalService.getCurrentGoal());
    }

    @PostMapping
    public Result<NutritionGoal> saveOrUpdate(@RequestBody NutritionGoal goal) {
        return Result.success(nutritionGoalService.saveOrUpdateGoal(goal));
    }
}
