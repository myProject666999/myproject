package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("questionnaire")
public class Questionnaire {
    private Long id;
    private Long userId;
    private Integer goal;
    private Integer fitnessLevel;
    private Integer trainingDaysPerWeek;
    private Integer trainingDurationPerSession;
    private Integer hasInjury;
    private String injuryDetails;
    private String equipmentAvailable;
    private String preferredExercises;
    private String dislikedExercises;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
