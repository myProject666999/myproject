package com.community.gridgovernance.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class WorkOrderReportDTO {
    @NotBlank(message = "标题不能为空")
    private String title;

    @NotBlank(message = "问题描述不能为空")
    private String description;

    @NotBlank(message = "工单类型不能为空")
    private String orderType;

    private String level;

    @NotNull(message = "上报人ID不能为空")
    private Long reporterId;

    @NotBlank(message = "上报人姓名不能为空")
    private String reporterName;

    @NotBlank(message = "上报人电话不能为空")
    private String reporterPhone;

    @NotNull(message = "经度不能为空")
    private BigDecimal lng;

    @NotNull(message = "纬度不能为空")
    private BigDecimal lat;

    @NotBlank(message = "详细地址不能为空")
    private String address;

    private String beforeImages;
}
