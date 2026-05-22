package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("daily_plan")
public class DailyPlan {
    private Long id;
    private Long weeklyPlanId;
    private LocalDate planDate;
    private Integer dayOfWeek;
    private Integer isRestDay;
    private String trainingFocus;
    private Integer totalDuration;
    private BigDecimal totalCalories;
    private Integer status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
