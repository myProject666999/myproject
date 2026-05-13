package com.gym.membership.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class GateAccessDTO {
    @NotBlank(message = "会员卡号不能为空")
    private String cardNo;
    
    private String gateNo;
    
    @NotBlank(message = "操作类型不能为空")
    private String action;
}
