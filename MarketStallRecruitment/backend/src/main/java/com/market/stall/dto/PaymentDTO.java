package com.market.stall.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentDTO {

    @NotNull
    private Long registrationId;

    @NotNull
    private Integer paymentMethod;
}
