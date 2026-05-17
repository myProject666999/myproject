package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("material_purchase")
public class MaterialPurchase {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long projectId;
    private Long materialId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private LocalDate purchaseDate;
    private LocalDate expectedArrivalDate;
    private Integer status;
    private String purchaser;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
