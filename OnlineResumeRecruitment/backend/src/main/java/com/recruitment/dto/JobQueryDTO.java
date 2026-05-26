package com.recruitment.dto;

import lombok.Data;

import javax.validation.constraints.Min;

@Data
public class JobQueryDTO {

    private String keyword;

    private String city;

    @Min(value = 0, message = "最低薪资不能小于0")
    private Integer minSalary;

    @Min(value = 0, message = "最高薪资不能小于0")
    private Integer maxSalary;

    private String industry;

    private String jobType;

    private String experience;

    private String education;

    @Min(value = 1, message = "页码不能小于1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页大小不能小于1")
    private Integer pageSize = 10;
}
