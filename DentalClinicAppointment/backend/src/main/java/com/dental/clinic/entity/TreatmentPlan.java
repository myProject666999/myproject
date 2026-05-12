package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("treatment_plan")
public class TreatmentPlan {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String planNo;
    private Long patientId;
    private Long doctorId;
    private Long clinicId;
    private String diagnosis;
    private String treatmentContent;
    private String toothPositions;
    private Integer totalStages;
    private Integer currentStage;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
    private LocalDate expectedStartDate;
    private LocalDate expectedEndDate;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
