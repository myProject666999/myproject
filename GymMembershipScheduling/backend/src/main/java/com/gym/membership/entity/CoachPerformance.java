package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("coach_performance")
public class CoachPerformance {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long coachId;
    private LocalDate performanceDate;
    private Integer privateClasses;
    private Integer groupClasses;
    private BigDecimal salesAmount;
    private BigDecimal commission;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
