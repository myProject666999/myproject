package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("herb")
public class Herb {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String pinyin;
    private String alias;
    private String category;
    private String nature;
    private String meridian;
    private String efficacy;
    private String dosageRange;
    private String contraindication;
    private String description;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
