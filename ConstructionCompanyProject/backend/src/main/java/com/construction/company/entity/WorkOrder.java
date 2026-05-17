package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("work_order")
public class WorkOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long nodeId;
    private Long workerId;
    private String workContent;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private Integer status;
    private BigDecimal workHours;
    private BigDecimal salary;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
