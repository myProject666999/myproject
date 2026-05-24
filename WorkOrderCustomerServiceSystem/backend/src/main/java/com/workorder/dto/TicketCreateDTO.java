package com.workorder.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class TicketCreateDTO {

    @NotBlank(message = "工单标题不能为空")
    private String title;

    @NotBlank(message = "工单描述不能为空")
    private String description;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;

    private String priority;

    @NotNull(message = "用户ID不能为空")
    private Long customerId;
}