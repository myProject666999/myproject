package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("receivable")
public class Receivable implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;

    private String counterparty;

    private Long amount;

    private String currency;

    private LocalDate dueDate;

    private Integer status;

    private LocalDate receivedDate;

    private Long receivedAmount;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableLogic
    private Integer isDeleted;
}
