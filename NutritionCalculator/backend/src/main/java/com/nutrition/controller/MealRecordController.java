package com.nutrition.controller;

import com.nutrition.common.Result;
import com.nutrition.dto.MealRecordDTO;
import com.nutrition.entity.MealRecord;
import com.nutrition.service.MealRecordService;
import com.nutrition.vo.DailyNutritionVO;
import com.nutrition.vo.WeeklyReportVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/meal-records")
public class MealRecordController {

    @Autowired
    private MealRecordService mealRecordService;

    @GetMapping("/daily")
    public Result<DailyNutritionVO> getDailyNutrition(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(mealRecordService.getDailyNutrition(date));
    }

    @GetMapping("/weekly-report")
    public Result<WeeklyReportVO> getWeeklyReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(mealRecordService.getWeeklyReport(date));
    }

    @GetMapping("/{id}/nutrition")
    public Result<Map<String, Object>> getNutrition(@PathVariable Long id) {
        return Result.success(mealRecordService.getMealRecordWithNutrition(id));
    }

    @PostMapping
    public Result<Void> save(@RequestBody MealRecordDTO dto) {
        MealRecord record = new MealRecord();
        BeanUtils.copyProperties(dto, record);
        mealRecordService.saveOrUpdate(record);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody MealRecordDTO dto) {
        MealRecord record = new MealRecord();
        BeanUtils.copyProperties(dto, record);
        mealRecordService.updateById(record);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        mealRecordService.removeById(id);
        return Result.success();
    }
}
