package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("job")
public class Job {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long companyId;

    private Long hrId;

    private String title;

    private String department;

    private String jobType;

    private Integer minSalary;

    private Integer maxSalary;

    private Integer salaryMonths;

    private String province;

    private String city;

    private String address;

    private String experience;

    private String education;

    private String keywords;

    private String description;

    private String requirements;

    private String benefits;

    private String status;

    private Integer viewCount;

    private Integer applyCount;

    private Integer hotScore;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer deleted;
}
