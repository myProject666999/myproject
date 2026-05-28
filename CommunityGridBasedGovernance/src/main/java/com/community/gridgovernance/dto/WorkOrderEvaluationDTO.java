package com.community.gridgovernance.dto;

import lombok.Data;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Data
public class WorkOrderEvaluationDTO {
    @NotNull(message = "工单ID不能为空")
    private Long orderId;

    @NotNull(message = "评价人ID不能为空")
    private Long reporterId;

    @NotNull(message = "总体评分不能为空")
    @Min(value = 1, message = "评分范围1-5星")
    @Max(value = 5, message = "评分范围1-5星")
    private Integer overallScore;

    @NotNull(message = "响应速度评分不能为空")
    @Min(value = 1, message = "评分范围1-5星")
    @Max(value = 5, message = "评分范围1-5星")
    private Integer responseSpeedScore;

    @NotNull(message = "处理质量评分不能为空")
    @Min(value = 1, message = "评分范围1-5星")
    @Max(value = 5, message = "评分范围1-5星")
    private Integer processQualityScore;

    @NotNull(message = "服务态度评分不能为空")
    @Min(value = 1, message = "评分范围1-5星")
    @Max(value = 5, message = "评分范围1-5星")
    private Integer serviceAttitudeScore;

    private String content;

    @NotNull(message = "是否满意不能为空")
    private Integer isSatisfied;
}
