package com.market.stall.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AuditDTO {

    @NotNull
    private Long registrationId;

    @NotNull
    private Integer auditStatus;

    private String auditRemark;
}
