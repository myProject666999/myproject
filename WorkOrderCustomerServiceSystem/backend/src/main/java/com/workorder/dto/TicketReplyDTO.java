package com.workorder.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class TicketReplyDTO {

    @NotNull(message = "工单ID不能为空")
    private Long ticketId;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "回复内容不能为空")
    private String content;

    private String attachments;
}