package com.mortgage.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class LoanCalculateResultVO {
    private BigDecimal loanAmount;

    private Integer loanTermMonths;

    private BigDecimal annualInterestRate;

    private String repaymentType;

    private String repaymentTypeName;

    private BigDecimal totalPayment;

    private BigDecimal totalInterest;

    private BigDecimal firstMonthPayment;

    private BigDecimal lastMonthPayment;

    private List<RepaymentPlanItemVO> repaymentPlan;
}
