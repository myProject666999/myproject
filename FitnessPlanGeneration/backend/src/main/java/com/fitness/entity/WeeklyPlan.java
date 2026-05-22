package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("weekly_plan")
public class WeeklyPlan {
    private Long id;
    private Long userId;
    private Long questionnaireId;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Integer goal;
    private Integer totalTrainingDays;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
