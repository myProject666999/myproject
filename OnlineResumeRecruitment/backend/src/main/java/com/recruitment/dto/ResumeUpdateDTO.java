package com.recruitment.dto;

import com.recruitment.entity.EducationExperience;
import com.recruitment.entity.ProjectExperience;
import com.recruitment.entity.WorkExperience;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

@Data
public class ResumeUpdateDTO {

    @NotBlank(message = "真实姓名不能为空")
    private String realName;

    @NotBlank(message = "性别不能为空")
    private String gender;

    private LocalDate birthday;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
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

    private List<WorkExperience> workExperiences;

    private List<EducationExperience> educationExperiences;

    private List<ProjectExperience> projectExperiences;
}
