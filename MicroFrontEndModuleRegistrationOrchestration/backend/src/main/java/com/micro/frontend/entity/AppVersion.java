package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("app_version")
public class AppVersion {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("version")
    private String version;

    @TableField("entry_url")
    private String entryUrl;

    @TableField("change_log")
    private String changeLog;

    @TableField("is_active")
    private Integer isActive;

    @TableField("compatible_framework")
    private String compatibleFramework;

    @TableField("package_size")
    private Long packageSize;

    @TableField("publish_time")
    private LocalDateTime publishTime;

    @TableField("publisher")
    private String publisher;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}
