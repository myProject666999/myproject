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

    private Long companyId;

    private String warningLevel;

    private LocalDate warningDate;

    private Long predictedBalance;

    private Long thresholdValue;

    private String currency;

    private String description;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
