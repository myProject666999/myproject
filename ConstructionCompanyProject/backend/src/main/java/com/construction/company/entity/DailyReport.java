package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("daily_report")
public class DailyReport {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long workOrderId;
    private Long workerId;
    private LocalDate reportDate;
    private String workContent;
    private BigDecimal workHours;
    private String problem;
    private String solution;
    private String tomorrowPlan;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
