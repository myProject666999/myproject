package com.fmr.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@TableName("visit_record")
public class VisitRecord {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long memberId;
    private LocalDate visitDate;
    private String hospital;
    private String department;
    private String doctor;
    private String chiefComplaint;
    private String diagnosis;
    private String prescription;
    private BigDecimal medicalFee;
    private LocalDate nextVisitDate;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
