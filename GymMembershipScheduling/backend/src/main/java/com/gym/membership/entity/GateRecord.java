package com.gym.membership.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("gate_record")
public class GateRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long cardId;
    private String gateNo;
    private LocalDateTime inTime;
    private LocalDateTime outTime;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
