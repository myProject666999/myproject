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

    private String transactionType;

    private Long amount;

    private String currency;

    private LocalDate transactionDate;

    private String counterparty;

    private String description;

    private String referenceNo;

    private Long companyId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
