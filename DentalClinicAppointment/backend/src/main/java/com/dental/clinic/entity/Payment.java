package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("payment")
public class Payment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String paymentNo;
    private Long patientId;
    private Long treatmentPlanId;
    private Long treatmentRecordId;
    private Long clinicId;
    private BigDecimal amount;
    private String paymentMethod;
    private String remark;
    private Long operatorId;
    private LocalDateTime createTime;
}
