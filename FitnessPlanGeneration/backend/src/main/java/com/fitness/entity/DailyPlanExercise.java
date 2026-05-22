package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("daily_plan_exercise")
public class DailyPlanExercise {
    private Long id;
    private Long dailyPlanId;
    private Long exerciseId;
    private Integer exerciseOrder;
    private Integer targetSets;
    private String targetReps;
    private Integer restSeconds;
    private Integer completedSets;
    private LocalDateTime createdAt;
}
