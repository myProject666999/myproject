package com.micro.frontend.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class RouteSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotBlank(message = "路由路径不能为空")
    private String routePath;

    @NotBlank(message = "路由名称不能为空")
    private String routeName;

    @NotNull(message = "应用ID不能为空")
    private Long appId;

    @NotBlank(message = "应用编码不能为空")
    private String appCode;

    private String menuName;

    private String menuIcon;

    private Long parentId = 0L;

    private Integer sortOrder = 0;

    private Integer isVisible = 1;

    private Integer isCache = 0;

    private String permissionCode;

    private Integer status = 1;
}
