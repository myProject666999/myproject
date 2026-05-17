package com.construction.company.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("worker")
public class Worker {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String phone;
    private String idCard;
    private String skill;
    private Integer workYears;
    private Integer status;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
