package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("patient_diagnosis")
public class PatientDiagnosis {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private LocalDate visitDate;
    private String chiefComplaint;
    private String presentHistory;
    private String pastHistory;
    private String tongueCondition;
    private String pulseCondition;
    private String diagnosis;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
