package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@TableName("proj_timesheet")
public class Timesheet {
    @TableId(type = IdType.AUTO)
    private Long timesheetId;
    private Long userId;
    private Long projectId;
    private LocalDate workDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal workHours;
    private String workContent;
    private Integer approvalStatus;
    private Long currentApproverId;
    private String rejectionReason;
    private LocalDateTime createTime;
    private LocalDateTime submitTime;
    private LocalDateTime approvalTime;
    private LocalDateTime updateTime;
}
