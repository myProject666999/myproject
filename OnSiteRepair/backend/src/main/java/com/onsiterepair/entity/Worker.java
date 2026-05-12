package com.onsiterepair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("worker")
public class Worker {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String phone;
    private String password;
    private String nickname;
    private String avatar;
    private String realName;
    private String idCard;
    private String idCardFront;
    private String idCardBack;
    private String skills;
    private String certificate;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private BigDecimal rating;
    private Integer orderCount;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
