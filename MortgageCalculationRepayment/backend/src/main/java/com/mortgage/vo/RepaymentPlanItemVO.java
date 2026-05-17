package com.mortgage.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RepaymentPlanItemVO {
    private Integer period;

    private LocalDate repaymentDate;

    private BigDecimal monthlyPayment;

    private BigDecimal principal;

    private BigDecimal interest;

    private BigDecimal remainingPrincipal;
}
