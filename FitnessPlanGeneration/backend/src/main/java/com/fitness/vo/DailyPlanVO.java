package com.fitness.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class DailyPlanVO {
    private Long id;
    private Long weeklyPlanId;
    private LocalDate planDate;
    private Integer dayOfWeek;
    private Integer isRestDay;
    private String trainingFocus;
    private Integer totalDuration;
    private BigDecimal totalCalories;
    private Integer status;
    private List<DailyPlanExerciseVO> exercises;
}
