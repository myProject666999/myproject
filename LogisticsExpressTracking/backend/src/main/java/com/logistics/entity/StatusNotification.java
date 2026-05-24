package com.logistics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("t_status_notification")
public class StatusNotification {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long waybillId;

    private String waybillNo;

    private Integer oldStatus;

    private Integer newStatus;

    private Integer notifyType;

    private String notifyContent;

    private String notifyTarget;

    private Integer isRead;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
