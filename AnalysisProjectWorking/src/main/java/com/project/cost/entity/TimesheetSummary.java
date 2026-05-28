package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("proj_timesheet_summary")
public class TimesheetSummary {
    @TableId(type = IdType.AUTO)
    private Long summaryId;
    private Long projectId;
    private Long userId;
    private LocalDate summaryDate;
    private String summaryType;
    private BigDecimal totalHours;
    private Integer totalCost;
    private BigDecimal approvedHours;
    private Integer approvedCost;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
