package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("work_experience")
public class WorkExperience {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long resumeId;

    private String companyName;

    private String position;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
