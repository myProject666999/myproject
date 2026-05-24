package com.workorder.dto;

import lombok.Data;

@Data
public class TicketQueryDTO {

    private String keyword;
    private String status;
    private String priority;
    private Long categoryId;
    private Long customerId;
    private Long agentId;
    private String slaStatus;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}