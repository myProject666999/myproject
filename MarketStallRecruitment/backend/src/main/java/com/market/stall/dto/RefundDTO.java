package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RefundDTO {

    @NotNull
    private Long paymentId;

    @NotBlank
    private String refundReason;
}
