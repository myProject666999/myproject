package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("receivable")
public class Receivable {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String customerName;
    private Long amount;
    private String currency;
    private LocalDate dueDate;
    private String status;
    private Long receivedAmount;
    private String description;

    @TableLogic
    private Integer isDeleted;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
