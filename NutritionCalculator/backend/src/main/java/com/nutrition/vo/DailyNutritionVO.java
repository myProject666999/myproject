package com.nutrition.vo;

import lombok.Data;

import java.util.List;

@Data
public class DailyNutritionVO {

    private String date;

    private Integer totalCalories;

    private Integer totalProtein;

    private Integer totalFat;

    private Integer totalCarbs;

    private List<MealRecordVO> records;

    private GoalCompareVO goalCompare;
}
