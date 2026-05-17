package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("project")
public class Project {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long contractId;
    private Long customerId;
    private String projectName;
    private String address;
    private String projectManager;
    private Integer status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
