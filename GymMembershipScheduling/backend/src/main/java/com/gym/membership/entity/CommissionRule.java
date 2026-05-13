package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("commission_rule")
public class CommissionRule {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String ruleName;
    private String ruleType;
    private BigDecimal commissionRate;
    private BigDecimal fixedAmount;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
