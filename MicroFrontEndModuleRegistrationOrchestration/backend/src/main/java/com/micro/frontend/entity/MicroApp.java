package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("micro_app")
public class MicroApp {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("app_code")
    private String appCode;

    @TableField("app_name")
    private String appName;

    @TableField("description")
    private String description;

    @TableField("current_version")
    private String currentVersion;

    @TableField("status")
    private Integer status;

    @TableField("owner")
    private String owner;

    @TableField("owner_email")
    private String ownerEmail;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    @TableLogic
    @TableField("deleted")
    private Integer deleted;
}
