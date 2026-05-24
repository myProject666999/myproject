package com.workorder.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("sla_log")
public class SlaLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ticketId;

    private String eventType;

    private LocalDateTime slaDeadline;

    private LocalDateTime actualTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}