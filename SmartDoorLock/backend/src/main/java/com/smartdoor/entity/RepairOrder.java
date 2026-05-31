package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("repair_order")
public class RepairOrder implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long contractId;

    private Long tenantId;

    private String tenantName;

    private Long apartmentId;

    private String apartmentNo;

    private String repairType;

    private String priority;

    private String title;

    private String description;

    private String images;

    private LocalDateTime reportTime;

    private Long reporterId;

    private String reporterName;

    private String reporterPhone;

    private String status;

    private Long assigneeId;

    private String assigneeName;

    private LocalDateTime assignTime;

    private LocalDateTime processStartTime;

    private String processDescription;

    private LocalDateTime completeTime;

    private BigDecimal costAmount;

    private String costBearer;

    private Integer satisfactionScore;

    private String satisfactionComment;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(String orderNo) {
        this.orderNo = orderNo;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public String getTenantName() {
        return tenantName;
    }

    public void setTenantName(String tenantName) {
        this.tenantName = tenantName;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getApartmentNo() {
        return apartmentNo;
    }

    public void setApartmentNo(String apartmentNo) {
        this.apartmentNo = apartmentNo;
    }

    public String getRepairType() {
        return repairType;
    }

    public void setRepairType(String repairType) {
        this.repairType = repairType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImages() {
        return images;
    }

    public void setImages(String images) {
        this.images = images;
    }

    public LocalDateTime getReportTime() {
        return reportTime;
    }

    public void setReportTime(LocalDateTime reportTime) {
        this.reportTime = reportTime;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterPhone() {
        return reporterPhone;
    }

    public void setReporterPhone(String reporterPhone) {
        this.reporterPhone = reporterPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }

    public LocalDateTime getAssignTime() {
        return assignTime;
    }

    public void setAssignTime(LocalDateTime assignTime) {
        this.assignTime = assignTime;
    }

    public LocalDateTime getProcessStartTime() {
        return processStartTime;
    }

    public void setProcessStartTime(LocalDateTime processStartTime) {
        this.processStartTime = processStartTime;
    }

    public String getProcessDescription() {
        return processDescription;
    }

    public void setProcessDescription(String processDescription) {
        this.processDescription = processDescription;
    }

    public LocalDateTime getCompleteTime() {
        return completeTime;
    }

    public void setCompleteTime(LocalDateTime completeTime) {
        this.completeTime = completeTime;
    }

    public BigDecimal getCostAmount() {
        return costAmount;
    }

    public void setCostAmount(BigDecimal costAmount) {
        this.costAmount = costAmount;
    }

    public String getCostBearer() {
        return costBearer;
    }

    public void setCostBearer(String costBearer) {
        this.costBearer = costBearer;
    }

    public Integer getSatisfactionScore() {
        return satisfactionScore;
    }

    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }

    public String getSatisfactionComment() {
        return satisfactionComment;
    }

    public void setSatisfactionComment(String satisfactionComment) {
        this.satisfactionComment = satisfactionComment;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public Integer getDeleted() {
        return deleted;
    }

    public void setDeleted(Integer deleted) {
        this.deleted = deleted;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RepairOrder that = (RepairOrder) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(orderNo, that.orderNo) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(repairType, that.repairType) &&
                Objects.equals(priority, that.priority) &&
                Objects.equals(title, that.title) &&
                Objects.equals(description, that.description) &&
                Objects.equals(images, that.images) &&
                Objects.equals(reportTime, that.reportTime) &&
                Objects.equals(reporterId, that.reporterId) &&
                Objects.equals(reporterName, that.reporterName) &&
                Objects.equals(reporterPhone, that.reporterPhone) &&
                Objects.equals(status, that.status) &&
                Objects.equals(assigneeId, that.assigneeId) &&
                Objects.equals(assigneeName, that.assigneeName) &&
                Objects.equals(assignTime, that.assignTime) &&
                Objects.equals(processStartTime, that.processStartTime) &&
                Objects.equals(processDescription, that.processDescription) &&
                Objects.equals(completeTime, that.completeTime) &&
                Objects.equals(costAmount, that.costAmount) &&
                Objects.equals(costBearer, that.costBearer) &&
                Objects.equals(satisfactionScore, that.satisfactionScore) &&
                Objects.equals(satisfactionComment, that.satisfactionComment) &&
                Objects.equals(remark, that.remark) &&
                Objects.equals(createTime, that.createTime) &&
                Objects.equals(updateTime, that.updateTime) &&
                Objects.equals(deleted, that.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, orderNo, contractId, tenantId, tenantName, apartmentId, apartmentNo, repairType, priority, title, description, images, reportTime, reporterId, reporterName, reporterPhone, status, assigneeId, assigneeName, assignTime, processStartTime, processDescription, completeTime, costAmount, costBearer, satisfactionScore, satisfactionComment, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "RepairOrder{" +
                "id=" + id +
                ", orderNo='" + orderNo + '\'' +
                ", contractId=" + contractId +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", repairType='" + repairType + '\'' +
                ", priority='" + priority + '\'' +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", images='" + images + '\'' +
                ", reportTime=" + reportTime +
                ", reporterId=" + reporterId +
                ", reporterName='" + reporterName + '\'' +
                ", reporterPhone='" + reporterPhone + '\'' +
                ", status='" + status + '\'' +
                ", assigneeId=" + assigneeId +
                ", assigneeName='" + assigneeName + '\'' +
                ", assignTime=" + assignTime +
                ", processStartTime=" + processStartTime +
                ", processDescription='" + processDescription + '\'' +
                ", completeTime=" + completeTime +
                ", costAmount=" + costAmount +
                ", costBearer='" + costBearer + '\'' +
                ", satisfactionScore=" + satisfactionScore +
                ", satisfactionComment='" + satisfactionComment + '\'' +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
