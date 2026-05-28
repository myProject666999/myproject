package com.creator.subscription.dto;

import lombok.Data;

import java.util.Map;

@Data
public class WithdrawRequest {
    private Long creatorId;
    private Long amount;
    private String withdrawalMethod;
    private Map<String, String> accountInfo;
}
