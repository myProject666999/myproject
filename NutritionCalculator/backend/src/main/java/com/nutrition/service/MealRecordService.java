package com.nutrition.service;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.nutrition.entity.Food;
import com.nutrition.entity.MealRecord;
import com.nutrition.entity.NutritionGoal;
import com.nutrition.mapper.FoodMapper;
import com.nutrition.mapper.MealRecordMapper;
import com.nutrition.mapper.NutritionGoalMapper;
import com.nutrition.vo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MealRecordService extends ServiceImpl<MealRecordMapper, MealRecord> {

    @Autowired
    private FoodMapper foodMapper;

    @Autowired
    private NutritionGoalMapper nutritionGoalMapper;

    public DailyNutritionVO getDailyNutrition(LocalDate date) {
        List<MealRecordVO> records = baseMapper.selectMealRecordsWithFood(date, date);

        int totalCalories = records.stream().mapToInt(MealRecordVO::getCalories).sum();
        int totalProtein = records.stream().mapToInt(MealRecordVO::getProtein).sum();
        int totalFat = records.stream().mapToInt(MealRecordVO::getFat).sum();
        int totalCarbs = records.stream().mapToInt(MealRecordVO::getCarbs).sum();

        DailyNutritionVO vo = new DailyNutritionVO();
        vo.setDate(date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        vo.setTotalCalories(totalCalories);
        vo.setTotalProtein(totalProtein);
        vo.setTotalFat(totalFat);
        vo.setTotalCarbs(totalCarbs);
        vo.setRecords(records);

        NutritionGoal goal = getLatestGoal();
        if (goal != null) {
            GoalCompareVO compareVO = buildGoalCompare(goal, totalCalories, totalProtein, totalFat, totalCarbs);
            vo.setGoalCompare(compareVO);
        }

        return vo;
    }

    public WeeklyReportVO getWeeklyReport(LocalDate date) {
        LocalDate monday = date.with(DayOfWeek.MONDAY);
        LocalDate sunday = date.with(DayOfWeek.SUNDAY);

        List<DailySummaryVO> summaries = baseMapper.selectDailySummary(monday, sunday);

        int totalDays = summaries.size();
        int avgCalories = totalDays > 0 ? summaries.stream().mapToInt(DailySummaryVO::getTotalCalories).sum() / totalDays : 0;
        int avgProtein = totalDays > 0 ? summaries.stream().mapToInt(DailySummaryVO::getTotalProtein).sum() / totalDays : 0;
        int avgFat = totalDays > 0 ? summaries.stream().mapToInt(DailySummaryVO::getTotalFat).sum() / totalDays : 0;
        int avgCarbs = totalDays > 0 ? summaries.stream().mapToInt(DailySummaryVO::getTotalCarbs).sum() / totalDays : 0;

        WeeklyReportVO vo = new WeeklyReportVO();
        vo.setStartDate(monday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        vo.setEndDate(sunday.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        vo.setAvgCalories(avgCalories);
        vo.setAvgProtein(avgProtein);
        vo.setAvgFat(avgFat);
        vo.setAvgCarbs(avgCarbs);
        vo.setDailySummaries(summaries);

        NutritionGoal goal = getLatestGoal();
        if (goal != null) {
            GoalCompareVO compareVO = buildGoalCompare(goal, avgCalories, avgProtein, avgFat, avgCarbs);
            vo.setGoalCompare(compareVO);
        }

        return vo;
    }

    public Map<String, Object> getMealRecordWithNutrition(Long id) {
        MealRecord record = getById(id);
        Food food = foodMapper.selectById(record.getFoodId());
        return calculateNutrition(record, food);
    }

    public Map<String, Object> calculateNutrition(MealRecord record, Food food) {
        Map<String, Object> result = new HashMap<>();
        double ratio = (double) record.getAmount() / food.getUnitGram();
        result.put("calories", (int) Math.round(food.getCalories() * ratio));
        result.put("protein", (int) Math.round(food.getProtein() * ratio));
        result.put("fat", (int) Math.round(food.getFat() * ratio));
        result.put("carbs", (int) Math.round(food.getCarbs() * ratio));
        result.put("amount", record.getAmount());
        result.put("unitGram", food.getUnitGram());
        return result;
    }

    private NutritionGoal getLatestGoal() {
        List<NutritionGoal> goals = nutritionGoalMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<NutritionGoal>()
                        .orderByDesc(NutritionGoal::getUpdateTime)
                        .last("LIMIT 1")
        );
        return goals.isEmpty() ? null : goals.get(0);
    }

    private GoalCompareVO buildGoalCompare(NutritionGoal goal, int calories, int protein, int fat, int carbs) {
        GoalCompareVO vo = new GoalCompareVO();
        vo.setTargetCalories(goal.getTargetCalories());
        vo.setTargetProtein(goal.getTargetProtein());
        vo.setTargetFat(goal.getTargetFat());
        vo.setTargetCarbs(goal.getTargetCarbs());

        vo.setCurrentCalories(calories);
        vo.setCurrentProtein(protein);
        vo.setCurrentFat(fat);
        vo.setCurrentCarbs(carbs);

        vo.setCaloriesPercentage(goal.getTargetCalories() > 0 ? Math.round((double) calories / goal.getTargetCalories() * 10000) / 100.0 : 0);
        vo.setProteinPercentage(goal.getTargetProtein() > 0 ? Math.round((double) protein / goal.getTargetProtein() * 10000) / 100.0 : 0);
        vo.setFatPercentage(goal.getTargetFat() > 0 ? Math.round((double) fat / goal.getTargetFat() * 10000) / 100.0 : 0);
        vo.setCarbsPercentage(goal.getTargetCarbs() > 0 ? Math.round((double) carbs / goal.getTargetCarbs() * 10000) / 100.0 : 0);

        return vo;
    }
}
