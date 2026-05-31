package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("payable")
public class Payable implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;

    private String counterparty;

    private Long amount;

    private String currency;

    private LocalDate dueDate;

    private Integer status;

    private LocalDate paidDate;

    private Long paidAmount;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
