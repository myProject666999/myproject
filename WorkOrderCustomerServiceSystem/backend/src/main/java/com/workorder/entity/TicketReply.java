package com.workorder.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket_reply")
public class TicketReply {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long ticketId;

    private Long userId;

    private String userRole;

    private String content;

    private String attachments;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(exist = false)
    private String userName;
}