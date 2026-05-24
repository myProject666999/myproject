package com.workorder.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket")
public class Ticket {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String ticketNo;

    private String title;

    private String description;

    private Long categoryId;

    private String priority;

    private String status;

    private Long customerId;

    private Long agentId;

    private LocalDateTime slaDeadline;

    private String slaStatus;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField(exist = false)
    private String customerName;

    @TableField(exist = false)
    private String agentName;

    @TableField(exist = false)
    private String categoryName;
}