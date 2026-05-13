package com.chess.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("member")
public class Member {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String memberNo;
    private String name;
    private String phone;
    private BigDecimal discountRate;
    private BigDecimal balance;
    private Integer points;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
