package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("app_dependency")
public class AppDependency {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("app_version_id")
    private Long appVersionId;

    @TableField("app_version")
    private String appVersion;

    @TableField("dependency_type")
    private String dependencyType;

    @TableField("dependency_code")
    private String dependencyCode;

    @TableField("dependency_name")
    private String dependencyName;

    @TableField("min_version")
    private String minVersion;

    @TableField("max_version")
    private String maxVersion;

    @TableField("is_required")
    private Integer isRequired;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
