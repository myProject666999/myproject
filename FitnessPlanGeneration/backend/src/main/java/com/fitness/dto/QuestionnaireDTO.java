package com.fitness.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class QuestionnaireDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    @NotNull(message = "目标不能为空")
    private Integer goal;
    @NotNull(message = "健身水平不能为空")
    private Integer fitnessLevel;
    @NotNull(message = "每周训练天数不能为空")
    private Integer trainingDaysPerWeek;
    @NotNull(message = "每次训练时长不能为空")
    private Integer trainingDurationPerSession;
    private Integer hasInjury;
    private String injuryDetails;
    private String equipmentAvailable;
    private String preferredExercises;
    private String dislikedExercises;
}
