package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("follow_up")
public class FollowUp {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private Long lastPrescriptionId;
    private LocalDate visitDate;
    @TableField("`condition`")
    private String condition;
    private String curativeEffect;
    private String adjustment;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
