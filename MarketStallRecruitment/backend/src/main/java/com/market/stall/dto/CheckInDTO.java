package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInDTO {

    @NotNull
    private Long eventId;

    @NotBlank
    private String checkInCode;
}
