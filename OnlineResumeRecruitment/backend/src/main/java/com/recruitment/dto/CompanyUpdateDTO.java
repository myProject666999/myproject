package com.recruitment.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class CompanyUpdateDTO {

    @NotBlank(message = "企业名称不能为空")
    private String name;

    private String industry;

    private String scale;

    private String province;

    private String city;

    private String address;

    private String logo;

    private String description;

    private String website;
}
