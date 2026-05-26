package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("chat_message")
public class ChatMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long senderId;

    private Long receiverId;

    private Long applicationId;

    private String content;

    private String type;

    private Integer isRead;

    private LocalDateTime readAt;

    private LocalDateTime createdAt;
}
