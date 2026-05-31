package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("account")
public class Account {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String accountName;
    private String bankName;
    private String accountNo;
    private String currency;
    private Long balance;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
