package com.notification.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("announcement_attachment")
public class Attachment {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long announcementId;

    private String fileName;

    private String filePath;

    private Long fileSize;

    private String fileType;

    private Integer downloadCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
