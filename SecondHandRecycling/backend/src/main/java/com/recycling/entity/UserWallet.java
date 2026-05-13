package com.recycling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("user_wallet")
public class UserWallet {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private Long userId;
    private BigDecimal balance;
    private BigDecimal frozenAmount;
    private BigDecimal totalIncome;
    private BigDecimal totalWithdraw;
    
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
