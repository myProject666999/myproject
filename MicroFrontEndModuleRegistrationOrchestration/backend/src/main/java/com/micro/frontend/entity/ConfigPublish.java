package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("config_publish")
public class ConfigPublish {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("publish_no")
    private String publishNo;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("config_snapshot")
    private String configSnapshot;

    @TableField("publish_type")
    private String publishType;

    @TableField("status")
    private Integer status;

    @TableField("push_status")
    private Integer pushStatus;

    @TableField("affected_clients")
    private Integer affectedClients;

    @TableField("publisher")
    private String publisher;

    @TableField("publish_time")
    private LocalDateTime publishTime;

    @TableField("remark")
    private String remark;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
