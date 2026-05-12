package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("herb_inventory")
public class HerbInventory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long herbId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String batchNo;
    private LocalDate expireDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
