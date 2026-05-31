package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("exchange_rate")
public class ExchangeRate implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String fromCurrency;

    private String toCurrency;

    private BigDecimal rate;

    private LocalDate effectiveDate;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
