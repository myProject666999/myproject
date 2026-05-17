package com.mortgage.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LoanSchemeDetailVO {
    private Long id;
    private String name;
    private BigDecimal loanAmount;
    private Integer loanTermMonths;
    private BigDecimal annualInterestRate;
    private String repaymentType;
    private String repaymentTypeName;
    private BigDecimal totalPayment;
    private BigDecimal totalInterest;
    private BigDecimal monthlyPayment;
    private BigDecimal paidPrincipal;
    private BigDecimal paidInterest;
    private BigDecimal remainingPrincipal;
    private BigDecimal remainingInterest;
    private Integer paidPeriods;
    private Integer remainingPeriods;
    private LocalDateTime createTime;
}
