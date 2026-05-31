package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

import com.baomidou.mybatisplus.annotation.TableField;

@Data
@TableName("route_config")
public class RouteConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("route_path")
    private String routePath;

    @TableField("route_name")
    private String routeName;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("menu_name")
    private String menuName;

    @TableField("menu_icon")
    private String menuIcon;

    @TableField("parent_id")
    private Long parentId;

    @TableField("sort_order")
    private Integer sortOrder;

    @TableField("is_visible")
    private Integer isVisible;

    @TableField("is_cache")
    private Integer isCache;

    @TableField("permission_code")
    private String permissionCode;

    @TableField("status")
    private Integer status;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    @TableField(exist = false)
    private List<RouteConfig> children;
}
