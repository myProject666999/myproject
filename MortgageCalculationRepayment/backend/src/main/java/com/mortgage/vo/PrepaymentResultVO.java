package com.mortgage.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PrepaymentResultVO {
    private BigDecimal prepaymentAmount;

    private String prepaymentType;

    private String prepaymentTypeName;

    private BigDecimal remainingPrincipalBefore;

    private BigDecimal remainingPrincipalAfter;

    private BigDecimal savedInterest;

    private Integer oldTermMonths;

    private Integer newTermMonths;

    private BigDecimal oldMonthlyPayment;

    private BigDecimal newMonthlyPayment;
}
