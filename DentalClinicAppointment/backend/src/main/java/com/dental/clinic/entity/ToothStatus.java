package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("tooth_status")
public class ToothStatus {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private Integer toothNumber;
    private String status;
    private String toothCondition;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
