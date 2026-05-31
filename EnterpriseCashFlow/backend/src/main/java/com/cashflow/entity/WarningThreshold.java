package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("warning_threshold")
public class WarningThreshold implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;

    private String currency;

    private Long yellowThreshold;

    private Long orangeThreshold;

    private Long redThreshold;

    private Integer horizonDays;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
