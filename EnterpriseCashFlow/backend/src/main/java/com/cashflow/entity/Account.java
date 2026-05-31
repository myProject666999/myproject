package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("account")
public class Account implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String accountName;

    private String accountNo;

    private String bankName;

    private String currency;

    private Long balance;

    private Long creditLimit;

    private Integer status;

    private Long companyId;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
