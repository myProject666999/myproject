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

    private LocalDate reportDate;

    private Long openingBalance;

    private Long totalIncome;

    private Long totalExpense;

    private Long closingBalance;

    private String contentJson;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
