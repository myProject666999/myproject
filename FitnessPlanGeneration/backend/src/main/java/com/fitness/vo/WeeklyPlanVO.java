package com.fitness.vo;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class WeeklyPlanVO {
    private Long id;
    private Long userId;
    private Long questionnaireId;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer goal;
    private Integer totalTrainingDays;
    private Integer status;
    private List<DailyPlanVO> dailyPlans;
}
