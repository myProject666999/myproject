package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("warning_record")
public class WarningRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private LocalDate triggerDate;

    private LocalDate gapDate;

    private Long gapAmount;

    private String level;

    private String status;

    private LocalDateTime resolvedAt;

    private String thresholdName;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
