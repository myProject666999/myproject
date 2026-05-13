package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("renewal_reminder")
public class RenewalReminder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long cardId;
    private Long userId;
    private String reminderType;
    private LocalDate reminderDate;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
