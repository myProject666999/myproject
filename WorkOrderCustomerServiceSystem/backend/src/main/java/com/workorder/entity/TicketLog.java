package com.workorder.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket_log")
public class TicketLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ticketId;

    private String action;

    private String oldValue;

    private String newValue;

    private Long operatorId;

    private String operatorName;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}