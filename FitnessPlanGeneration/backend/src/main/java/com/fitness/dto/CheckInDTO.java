package com.fitness.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckInDTO {
    private Long userId;
    private Long dailyPlanId;
    private BigDecimal weight;
    private BigDecimal bodyFat;
    private Integer mood;
    private Integer energyLevel;
    private Integer actualDuration;
    private BigDecimal actualCalories;
    private String notes;
}
