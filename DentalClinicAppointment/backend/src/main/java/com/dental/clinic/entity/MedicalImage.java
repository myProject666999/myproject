package com.dental.clinic.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("medical_image")
public class MedicalImage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long patientId;
    private Long treatmentRecordId;
    private String imageType;
    private String imageName;
    private String imagePath;
    private String toothPositions;
    private String description;
    private LocalDateTime takeDate;
    private Long uploaderId;
    private LocalDateTime createTime;
}
