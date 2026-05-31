package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("warning_threshold")
public class WarningThreshold implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String type;

    private Long absoluteAmount;

    private BigDecimal percentage;

    private String level;

    private Integer isEnabled;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
