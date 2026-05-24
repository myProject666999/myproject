package com.logistics.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class TrackingNodeCreateDTO {
    @NotNull(message = "运单ID不能为空")
    private Long waybillId;

    @NotBlank(message = "运单号不能为空")
    private String waybillNo;

    @NotNull(message = "节点类型不能为空")
    private Integer nodeType;

    @NotBlank(message = "位置不能为空")
    private String location;

    private String description;

    private String operator;

    private String operatorPhone;
}
