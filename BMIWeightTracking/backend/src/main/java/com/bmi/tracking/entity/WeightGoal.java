package com.bmi.tracking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("weight_goal")
public class WeightGoal {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private BigDecimal targetWeight;
    private LocalDate targetDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
