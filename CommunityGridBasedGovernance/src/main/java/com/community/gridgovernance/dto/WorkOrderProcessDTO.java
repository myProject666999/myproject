package com.community.gridgovernance.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class WorkOrderProcessDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "操作人ID不能为空")
    private Long operatorId;

    private String processResult;

    private String afterImages;

    private String remark;
}
