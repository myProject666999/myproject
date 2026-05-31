package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("account_transaction")
public class AccountTransaction implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long accountId;

    private String type;

    private Long amount;

    private String currency;

    private String description;

    private LocalDate transactionDate;

    private String relatedType;

    private Long relatedId;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
