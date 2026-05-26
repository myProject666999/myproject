package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("resume")
public class Resume {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String realName;

    private String gender;

    private LocalDate birthday;

    private String phone;

    private String email;

    private String province;

    private String city;

    private String avatar;

    private String intentionPosition;

    private String intentionCity;

    private Integer intentionSalaryMin;

    private Integer intentionSalaryMax;

    private String workStatus;

    private String education;

    private String graduateSchool;

    private String major;

    private LocalDate graduateDate;

    private Integer workExperience;

    private String skills;

    private String selfIntroduction;

    private String attachmentUrl;

    private Integer isPublic;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer deleted;
}
