package com.fitness.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("check_in_record")
public class CheckInRecord {
    private Long id;
    private Long userId;
    private Long dailyPlanId;
    private LocalDate checkInDate;
    private BigDecimal weight;
    private BigDecimal bodyFat;
    private Integer mood;
    private Integer energyLevel;
    private Integer actualDuration;
    private BigDecimal actualCalories;
    private String notes;
    private LocalDateTime createdAt;
}
