package com.itinerary.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("share")
public class Share {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long itineraryId;
    private Long userId;
    private String shareCode;
    private String shareUrl;
    private LocalDateTime expireAt;
    private Integer canEdit;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    private Integer expired;
    @TableLogic
    private Integer deleted;
}
