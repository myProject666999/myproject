package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("treatment_record")
public class TreatmentRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String recordNo;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private Long clinicId;
    private String diagnosis;
    private String treatmentPlan;
    private String treatmentContent;
    private String toothPositions;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
