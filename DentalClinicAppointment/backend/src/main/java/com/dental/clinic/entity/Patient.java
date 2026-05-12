package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("patient")
public class Patient {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String gender;
    private LocalDate birthDate;
    private String phone;
    private String email;
    private String idCard;
    private String address;
    private String maritalStatus;
    private String occupation;
    private String medicalHistory;
    private String allergyHistory;
    private String emergencyContact;
    private String emergencyPhone;
    private String remark;
    private Long clinicId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
