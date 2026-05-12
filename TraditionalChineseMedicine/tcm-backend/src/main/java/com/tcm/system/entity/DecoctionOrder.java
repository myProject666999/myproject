package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("decoction_order")
public class DecoctionOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long prescriptionId;
    private String orderNo;
    private String decoctionType;
    private Integer packageCount;
    private String operator;
    private LocalDateTime startTime;
    private LocalDateTime completeTime;
    private Integer status;
    private String note;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
