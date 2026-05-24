package com.logistics.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_waybill")
public class Waybill {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String waybillNo;

    private String senderName;

    private String senderPhone;

    private String senderAddress;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;

    private String goodsName;

    private BigDecimal goodsWeight;

    private BigDecimal freight;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
