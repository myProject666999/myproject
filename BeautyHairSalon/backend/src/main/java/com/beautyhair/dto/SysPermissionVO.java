
package com.beautyhair.dto;

import lombok.Data;

import java.util.List;

@Data
public class SysPermissionVO {
    private Long id;
    private String permissionName;
    private String permissionCode;
    private Long parentId;
    private Integer type;
    private String path;
    private String component;
    private String icon;
    private Integer sort;
    private List<SysPermissionVO> children;
}
