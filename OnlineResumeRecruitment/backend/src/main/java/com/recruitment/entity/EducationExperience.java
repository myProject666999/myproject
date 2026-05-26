package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("education_experience")
public class EducationExperience {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long resumeId;

    private String school;

    private String major;

    private String education;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
