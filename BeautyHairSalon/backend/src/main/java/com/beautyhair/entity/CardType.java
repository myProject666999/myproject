
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("card_type")
public class CardType {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String cardName;
    private Integer cardType;
    private String cardCode;
    private java.math.BigDecimal faceValue;
    private java.math.BigDecimal giveValue;
    private Integer validityDays;
    private String description;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
