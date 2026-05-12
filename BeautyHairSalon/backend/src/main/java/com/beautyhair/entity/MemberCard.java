
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("member_card")
public class MemberCard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long memberId;
    private Long cardTypeId;
    private String cardNo;
    private java.math.BigDecimal balance;
    private Integer totalTimes;
    private Integer remainingTimes;
    private java.math.BigDecimal buyPrice;
    private LocalDate buyDate;
    private LocalDate expireDate;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String memberName;

    @TableField(exist = false)
    private String cardName;

    @TableField(exist = false)
    private Integer cardType;
}
