package com.micro.frontend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class GrayCreateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "应用ID不能为空")
    private Long appId;

    @NotBlank(message = "应用编码不能为空")
    private String appCode;

    @NotNull(message = "目标版本ID不能为空")
    private Long targetVersionId;

    @NotBlank(message = "目标版本号不能为空")
    private String targetVersion;

    @NotNull(message = "基准版本ID不能为空")
    private Long baseVersionId;

    @NotBlank(message = "基准版本号不能为空")
    private String baseVersion;

    @NotBlank(message = "灰度类型不能为空")
    private String grayType;

    @NotBlank(message = "灰度值不能为空")
    private String grayValue;

    private String grayRule;

    private String creator;
}
