
package com.beautyhair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("member")
public class Member {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String memberNo;
    private String memberName;
    private String phone;
    private Integer gender;
    private LocalDate birthday;
    private String idCard;
    private String address;
    private String email;
    private String level;
    private Integer points;
    private java.math.BigDecimal balance;
    private String skinType;
    private String hairType;
    private String allergyInfo;
    private String remark;
    private String avatar;
    private Long referralMemberId;
    private Long registerStoreId;
    private LocalDate registerDate;
    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
