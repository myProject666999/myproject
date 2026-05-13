package com.chess.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("table_info")
public class TableInfo {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tableNo;
    private Long typeId;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @TableField(exist = false)
    private String typeName;

    @TableField(exist = false)
    private java.math.BigDecimal hourlyRate;

    @TableField(exist = false)
    private Long currentOrderId;

    @TableField(exist = false)
    private LocalDateTime startTime;
}
