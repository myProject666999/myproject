package com.gym.membership.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class MembershipCardPurchaseDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    @NotNull(message = "卡类型ID不能为空")
    private Long cardTypeId;
    
    @NotNull(message = "支付金额不能为空")
    private BigDecimal amount;
    
    private String payType;
}
