package com.medication.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("low_stock_alert")
public class LowStockAlert {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long inventoryId;

    private Long userId;

    private Long medicineId;

    private String alertType;

    private String currentValue;

    private String threshold;

    private Integer status;

    private LocalDateTime alertTime;

    private LocalDateTime handleTime;
}
