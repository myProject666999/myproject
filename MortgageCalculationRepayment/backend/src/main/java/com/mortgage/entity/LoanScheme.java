package com.mortgage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("loan_scheme")
public class LoanScheme {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private BigDecimal loanAmount;

    private Integer loanTermMonths;

    private BigDecimal annualInterestRate;

    private String repaymentType;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
