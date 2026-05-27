package com.notification.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("announcement_comment")
public class Comment {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long announcementId;

    private Long userId;

    private String userName;

    private String userAvatar;

    private String content;

    private Long parentId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(exist = false)
    private java.util.List<Comment> children;
}
