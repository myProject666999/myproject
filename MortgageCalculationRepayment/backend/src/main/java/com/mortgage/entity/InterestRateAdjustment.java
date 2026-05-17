package com.mortgage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("interest_rate_adjustment")
public class InterestRateAdjustment {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long loanSchemeId;

    private LocalDate adjustmentDate;

    private BigDecimal oldRate;

    private BigDecimal newRate;

    private LocalDate effectiveDate;

    private LocalDateTime createTime;
}
