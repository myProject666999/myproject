package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("daily_report")
public class DailyReport implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;

    private LocalDate reportDate;

    private Long totalBalance;

    private Long totalIncome;

    private Long totalExpense;

    private Long netCashflow;

    private Integer warningCount;

    private String summary;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
