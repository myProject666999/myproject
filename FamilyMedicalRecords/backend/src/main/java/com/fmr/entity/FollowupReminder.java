package com.fmr.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@TableName("followup_reminder")
public class FollowupReminder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long visitId;
    private Long memberId;
    private LocalDate remindDate;
    private String content;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
