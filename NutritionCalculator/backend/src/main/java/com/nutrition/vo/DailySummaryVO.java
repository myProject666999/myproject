package com.nutrition.vo;

import lombok.Data;

@Data
public class DailySummaryVO {

    private String date;

    private Integer totalCalories;

    private Integer totalProtein;

    private Integer totalFat;

    private Integer totalCarbs;
}
