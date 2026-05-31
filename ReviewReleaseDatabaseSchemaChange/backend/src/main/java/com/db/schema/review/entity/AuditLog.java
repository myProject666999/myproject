package com.db.schema.review.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("audit_log")
public class AuditLog {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String logNo;

    private Long userId;

    private String userName;

    private String module;

    private String operation;

    private Long targetId;

    private String targetType;

    private String targetTitle;

    private String beforeData;

    private String afterData;

    private String changeDetail;

    private String ipAddress;

    private String userAgent;

    private LocalDateTime operationTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
