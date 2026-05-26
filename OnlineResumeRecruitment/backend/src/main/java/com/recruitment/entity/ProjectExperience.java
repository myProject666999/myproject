package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("project_experience")
public class ProjectExperience {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long resumeId;

    private String name;

    private String role;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private String technology;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
