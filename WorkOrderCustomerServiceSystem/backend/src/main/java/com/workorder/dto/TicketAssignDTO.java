package com.workorder.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class TicketAssignDTO {

    @NotNull(message = "工单ID不能为空")
    private Long ticketId;

    @NotNull(message = "客服ID不能为空")
    private Long agentId;

    private Long operatorId;
}