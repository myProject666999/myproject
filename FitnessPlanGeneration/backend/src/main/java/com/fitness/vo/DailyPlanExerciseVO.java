package com.fitness.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DailyPlanExerciseVO {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String category;
    private String muscleGroup;
    private Integer exerciseOrder;
    private Integer targetSets;
    private String targetReps;
    private Integer restSeconds;
    private Integer completedSets;
    private String equipment;
    private String description;
    private BigDecimal caloriesPerSet;
}
