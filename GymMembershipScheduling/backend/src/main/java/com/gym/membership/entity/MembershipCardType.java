package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("membership_card_type")
public class MembershipCardType {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String typeName;
    private String typeCode;
    private Integer durationDays;
    private Integer totalTimes;
    private BigDecimal price;
    private String description;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
