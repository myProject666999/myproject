package com.mortgage.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoanCalculateDTO {
    @NotNull(message = "贷款金额不能为空")
    @DecimalMin(value = "0.01", message = "贷款金额必须大于0")
    private BigDecimal loanAmount;

    @NotNull(message = "贷款期限不能为空")
    @Min(value = 1, message = "贷款期限至少1个月")
    private Integer loanTermMonths;

    @NotNull(message = "年利率不能为空")
    @DecimalMin(value = "0.01", message = "年利率必须大于0")
    private BigDecimal annualInterestRate;

    @NotBlank(message = "还款方式不能为空")
    private String repaymentType;
}
