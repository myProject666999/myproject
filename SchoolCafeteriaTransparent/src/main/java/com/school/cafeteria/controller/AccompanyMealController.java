package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.AccompanyMeal;
import com.school.cafeteria.entity.MealEvaluation;
import com.school.cafeteria.service.AccompanyMealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/accompany")
public class AccompanyMealController {

    @Autowired
    private AccompanyMealService accompanyMealService;

    @GetMapping("/public/list")
    public Result<List<AccompanyMeal>> getAll() {
        List<AccompanyMeal> list = accompanyMealService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<AccompanyMeal> getById(@PathVariable Long id) {
        Optional<AccompanyMeal> meal = accompanyMealService.findById(id);
        return meal.map(Result::success).orElse(Result.error("记录不存在"));
    }

    @GetMapping("/public/date/{date}")
    public Result<List<AccompanyMeal>> getByDate(@PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        List<AccompanyMeal> list = accompanyMealService.findByDate(date);
        return Result.success(list);
    }

    @GetMapping("/public/range")
    public Result<List<AccompanyMeal>> getByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<AccompanyMeal> list = accompanyMealService.findByDateRange(startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/public/type/{type}")
    public Result<List<AccompanyMeal>> getByType(@PathVariable String type) {
        List<AccompanyMeal> list = accompanyMealService.findByType(type);
        return Result.success(list);
    }

    @GetMapping("/public/statistics")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = accompanyMealService.getEvaluationStatistics();
        return Result.success(stats);
    }

    @PostMapping
    public Result<AccompanyMeal> create(@RequestBody AccompanyMeal meal) {
        AccompanyMeal saved = accompanyMealService.save(meal);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<AccompanyMeal> update(@PathVariable Long id, @RequestBody AccompanyMeal meal) {
        Optional<AccompanyMeal> existing = accompanyMealService.findById(id);
        if (!existing.isPresent()) {
            return Result.error("记录不存在");
        }
        meal.setId(id);
        AccompanyMeal saved = accompanyMealService.save(meal);
        return Result.success("更新成功", saved);
    }

    @PostMapping("/evaluation")
    public Result<MealEvaluation> submitEvaluation(@RequestBody MealEvaluation evaluation) {
        MealEvaluation saved = accompanyMealService.saveEvaluation(evaluation);
        return Result.success("评价成功", saved);
    }

    @GetMapping("/{id}/evaluation")
    public Result<MealEvaluation> getEvaluation(@PathVariable Long id) {
        Optional<MealEvaluation> evaluation = accompanyMealService.findEvaluationByMealId(id);
        return evaluation.map(Result::success).orElse(Result.error("评价不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        accompanyMealService.delete(id);
        return Result.success();
    }
}
