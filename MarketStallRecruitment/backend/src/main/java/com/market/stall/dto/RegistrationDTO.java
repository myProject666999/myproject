package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationDTO {

    @NotNull
    private Long eventId;

    @NotBlank
    private String businessName;

    @NotNull
    private Integer businessType;

    private String businessDesc;

    private String businessImages;

    private String idCardNumber;

    @NotBlank
    private String contactPhone;
}
