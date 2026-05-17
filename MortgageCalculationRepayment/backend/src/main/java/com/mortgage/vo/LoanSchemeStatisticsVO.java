package com.mortgage.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanSchemeStatisticsVO {
    private BigDecimal totalLoanAmount;
    private BigDecimal totalPaidPrincipal;
    private BigDecimal totalPaidInterest;
    private BigDecimal totalRemainingPrincipal;
    private BigDecimal totalRemainingInterest;
    private Long schemeCount;
}
