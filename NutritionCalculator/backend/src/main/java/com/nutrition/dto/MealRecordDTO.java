package com.nutrition.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MealRecordDTO {

    private Long id;

    private LocalDate mealDate;

    private String mealType;

    private Long foodId;

    private String foodName;

    private Integer amount;

    private Integer calories;

    private Integer protein;

    private Integer fat;

    private Integer carbs;
}
