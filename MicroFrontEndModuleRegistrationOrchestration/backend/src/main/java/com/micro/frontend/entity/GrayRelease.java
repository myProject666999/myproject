package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName(value = "gray_release")
public class GrayRelease {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("gray_no")
    private String grayNo;

    @TableField("app_id")
    private Long appId;

    @TableField("app_code")
    private String appCode;

    @TableField("target_version_id")
    private Long targetVersionId;

    @TableField("target_version")
    private String targetVersion;

    @TableField("base_version_id")
    private Long baseVersionId;

    @TableField("base_version")
    private String baseVersion;

    @TableField("gray_type")
    private String grayType;

    @TableField("gray_value")
    private String grayValue;

    @TableField("gray_rule")
    private String grayRule;

    @TableField("status")
    private Integer status;

    @TableField("start_time")
    private LocalDateTime startTime;

    @TableField("end_time")
    private LocalDateTime endTime;

    @TableField("hit_count")
    private Long hitCount;

    @TableField("total_count")
    private Long totalCount;

    @TableField("creator")
    private String creator;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;
}
