package com.cashflow.entity;

import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@TableName("warning_record")
public class WarningRecord implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private LocalDate triggerDate;

    private LocalDate gapDate;

    private Long gapAmount;

    private String level;

    private String status;

    private LocalDateTime resolvedAt;

    private String thresholdName;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getTriggerDate() {
        return triggerDate;
    }

    public void setTriggerDate(LocalDate triggerDate) {
        this.triggerDate = triggerDate;
    }

    public LocalDate getGapDate() {
        return gapDate;
    }

    public void setGapDate(LocalDate gapDate) {
        this.gapDate = gapDate;
    }

    public Long getGapAmount() {
        return gapAmount;
    }

    public void setGapAmount(Long gapAmount) {
        this.gapAmount = gapAmount;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getThresholdName() {
        return thresholdName;
    }

    public void setThresholdName(String thresholdName) {
        this.thresholdName = thresholdName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
