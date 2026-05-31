package com.micro.frontend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

@Data
public class ConfigPublishDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long appId;

    private String appCode;

    @NotBlank(message = "发布类型不能为空")
    private String publishType;

    private String publisher;

    private String remark;
}
