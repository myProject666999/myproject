package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("warranty")
public class Warranty {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long customerId;
    private Long acceptanceId;
    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private String warrantyContent;
    private String warrantyItems;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
