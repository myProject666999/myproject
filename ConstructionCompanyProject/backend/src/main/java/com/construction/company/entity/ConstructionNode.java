package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("construction_node")
public class ConstructionNode {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private String nodeName;
    private Integer nodeType;
    private LocalDate planStartDate;
    private LocalDate planEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private Integer status;
    private Integer progress;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
