package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("patient")
public class Patient {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer gender;
    private Integer age;
    private String phone;
    private String idCard;
    private String address;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
