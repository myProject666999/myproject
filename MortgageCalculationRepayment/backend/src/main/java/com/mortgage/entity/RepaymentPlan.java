package com.mortgage.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("repayment_plan")
public class RepaymentPlan {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long loanSchemeId;

    private Integer period;

    private LocalDate repaymentDate;

    private BigDecimal monthlyPayment;

    private BigDecimal principal;

    private BigDecimal interest;

    private BigDecimal remainingPrincipal;

    private BigDecimal paidPrincipal;

    private BigDecimal paidInterest;

    private Integer isOverdue;

    private LocalDateTime createTime;
}
