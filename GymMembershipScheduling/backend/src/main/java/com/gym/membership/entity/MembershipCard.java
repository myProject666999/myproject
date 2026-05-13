package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("membership_card")
public class MembershipCard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String cardNo;
    private Long userId;
    private Long cardTypeId;
    private Integer status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer remainingTimes;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
