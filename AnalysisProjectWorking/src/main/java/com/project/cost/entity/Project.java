package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("proj_project")
public class Project {
    @TableId(type = IdType.AUTO)
    private Long projectId;
    private String projectCode;
    private String projectName;
    private String projectType;
    private Long deptId;
    private Long managerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer budgetCost;
    private BigDecimal budgetHours;
    private String description;
    private Integer status;
    private Long createBy;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
