package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("prescription")
public class Prescription {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private Long diagnosisId;
    private Long templateId;
    private String prescriptionNo;
    private String doctorName;
    private LocalDate visitDate;
    private String diagnosisText;
    private String treatment;
    private Integer totalDosage;
    private String usage;
    private String note;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
