package com.micro.frontend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("audit_log")
public class AuditLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("audit_no")
    private String auditNo;

    @TableField("operation_type")
    private String operationType;

    @TableField("module")
    private String module;

    @TableField("target_table")
    private String targetTable;

    @TableField("target_id")
    private Long targetId;

    @TableField("target_key")
    private String targetKey;

    @TableField("operator")
    private String operator;

    @TableField("operator_ip")
    private String operatorIp;

    @TableField("old_value")
    private String oldValue;

    @TableField("new_value")
    private String newValue;

    @TableField("change_summary")
    private String changeSummary;

    @TableField("created_at")
    private LocalDateTime createdAt;
}
