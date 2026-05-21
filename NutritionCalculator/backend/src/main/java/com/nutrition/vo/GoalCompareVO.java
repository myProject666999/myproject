package com.nutrition.vo;

import lombok.Data;

@Data
public class GoalCompareVO {

    private Integer targetCalories;
    private Integer targetProtein;
    private Integer targetFat;
    private Integer targetCarbs;

    private Integer currentCalories;
    private Integer currentProtein;
    private Integer currentFat;
    private Integer currentCarbs;

    private Double caloriesPercentage;
    private Double proteinPercentage;
    private Double fatPercentage;
    private Double carbsPercentage;
}
