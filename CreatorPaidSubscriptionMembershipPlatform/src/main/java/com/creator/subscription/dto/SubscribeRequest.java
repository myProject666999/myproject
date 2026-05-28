package com.creator.subscription.dto;

import com.creator.subscription.enums.PaymentMethod;
import lombok.Data;

@Data
public class SubscribeRequest {
    private Long userId;
    private Long creatorId;
    private Long tierId;
    private PaymentMethod paymentMethod;
}
