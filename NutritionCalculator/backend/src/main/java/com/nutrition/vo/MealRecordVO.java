package com.nutrition.vo;

import lombok.Data;

@Data
public class MealRecordVO {

    private Long id;

    private String mealType;

    private String foodName;

    private Integer amount;

    private Integer calories;

    private Integer protein;

    private Integer fat;

    private Integer carbs;
}
