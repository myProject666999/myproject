package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("health_check")
public class HealthCheck {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("check_url")
    private String checkUrl;

    @TableField("check_interval")
    private Integer checkInterval;

    @TableField("timeout")
    private Integer timeout;

    @TableField("success_threshold")
    private Integer successThreshold;

    @TableField("fail_threshold")
    private Integer failThreshold;

    @TableField("auto_offline")
    private Integer autoOffline;

    @TableField("status")
    private Integer status;

    @TableField("health_status")
    private Integer healthStatus;

    @TableField("last_check_time")
    private LocalDateTime lastCheckTime;

    @TableField("last_check_result")
    private String lastCheckResult;

    @TableField("last_response_time")
    private Integer lastResponseTime;

    @TableField("consecutive_success")
    private Integer consecutiveSuccess;

    @TableField("consecutive_fail")
    private Integer consecutiveFail;

    @TableField("last_offline_time")
    private LocalDateTime lastOfflineTime;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
