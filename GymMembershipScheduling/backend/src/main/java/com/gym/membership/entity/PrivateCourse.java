package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("private_course")
public class PrivateCourse {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long coachId;
    private Integer totalHours;
    private Integer remainingHours;
    private BigDecimal price;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
