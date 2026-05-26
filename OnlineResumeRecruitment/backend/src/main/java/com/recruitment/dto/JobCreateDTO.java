package com.recruitment.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;
import java.util.List;

@Data
public class JobCreateDTO {

    @NotBlank(message = "职位名称不能为空")
    private String title;

    @NotBlank(message = "所属部门不能为空")
    private String department;

    @NotBlank(message = "职位类型不能为空")
    private String jobType;

    @NotNull(message = "最低薪资不能为空")
    @Min(value = 0, message = "最低薪资不能小于0")
    private Integer minSalary;

    @NotNull(message = "最高薪资不能为空")
    @Min(value = 0, message = "最高薪资不能小于0")
    private Integer maxSalary;

    @NotNull(message = "薪资月数不能为空")
    @Min(value = 1, message = "薪资月数不能小于1")
    private Integer salaryMonths;

    @NotBlank(message = "省份不能为空")
    private String province;

    @NotBlank(message = "城市不能为空")
    private String city;

    @NotBlank(message = "详细地址不能为空")
    private String address;

    @NotBlank(message = "工作经验不能为空")
    private String experience;

    @NotBlank(message = "学历要求不能为空")
    private String education;

    private List<String> keywords;

    @NotBlank(message = "职位描述不能为空")
    private String description;

    @NotBlank(message = "任职要求不能为空")
    private String requirements;

    private String benefits;
}
