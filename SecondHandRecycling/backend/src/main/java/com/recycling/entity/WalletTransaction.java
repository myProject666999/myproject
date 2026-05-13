package com.recycling.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("wallet_transaction")
public class WalletTransaction {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String transactionNo;
    private Long userId;
    private String type;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private Long relatedOrderId;
    private String remark;
    
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
