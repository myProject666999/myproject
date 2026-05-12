package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("prescription_template")
public class PrescriptionTemplate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String pinyin;
    private String source;
    private String category;
    private String composition;
    @TableField("`usage`")
    private String usage;
    private String efficacy;
    private String indication;
    private String contraindication;
    private Integer isClassic;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
