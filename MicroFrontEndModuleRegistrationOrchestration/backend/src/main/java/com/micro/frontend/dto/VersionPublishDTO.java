package com.micro.frontend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class VersionPublishDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "应用ID不能为空")
    private Long appId;

    @NotBlank(message = "应用编码不能为空")
    private String appCode;

    @NotBlank(message = "版本号不能为空")
    private String version;

    @NotBlank(message = "应用入口地址不能为空")
    private String entryUrl;

    private String changeLog;

    private String compatibleFramework;

    private Long packageSize;

    private String publisher;
}
