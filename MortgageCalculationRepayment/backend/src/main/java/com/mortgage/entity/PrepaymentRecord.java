package com.mortgage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("prepayment_record")
public class PrepaymentRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long loanSchemeId;

    private LocalDate prepaymentDate;

    private BigDecimal prepaymentAmount;

    private String prepaymentType;

    private BigDecimal remainingPrincipalBefore;

    private BigDecimal remainingPrincipalAfter;

    private BigDecimal savedInterest;

    private Integer newTermMonths;

    private BigDecimal newMonthlyPayment;

    private LocalDateTime createTime;
}
