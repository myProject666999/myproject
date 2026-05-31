package com.micro.frontend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

@Data
public class AppRegisterDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "应用编码不能为空")
    private String appCode;

    @NotBlank(message = "应用名称不能为空")
    private String appName;

    private String description;

    private String owner;

    private String ownerEmail;

    private Integer status;
}
