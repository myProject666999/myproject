package com.chess.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("table_type")
public class TableType {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private BigDecimal hourlyRate;
    private String description;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
