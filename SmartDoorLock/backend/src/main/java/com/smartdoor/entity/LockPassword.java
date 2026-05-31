package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("lock_password")
public class LockPassword implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String passwordNo;

    private Long lockId;

    private String lockNo;

    private Long apartmentId;

    private Long contractId;

    private Long tenantId;

    private String tenantName;

    private String passwordType;

    private String password;

    private LocalDateTime effectiveTime;

    private LocalDateTime expireTime;

    private String permissionType;

    private Integer useLimit;

    private Integer usedCount;

    private LocalDateTime lastUseTime;

    private String sendStatus;

    private LocalDateTime sendTime;

    private String sendRequestId;

    private String sendFailReason;

    private String status;

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

    public String getPasswordNo() {
        return passwordNo;
    }

    public void setPasswordNo(String passwordNo) {
        this.passwordNo = passwordNo;
    }

    public Long getLockId() {
        return lockId;
    }

    public void setLockId(Long lockId) {
        this.lockId = lockId;
    }

    public String getLockNo() {
        return lockNo;
    }

    public void setLockNo(String lockNo) {
        this.lockNo = lockNo;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
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

    public String getPasswordType() {
        return passwordType;
    }

    public void setPasswordType(String passwordType) {
        this.passwordType = passwordType;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public LocalDateTime getEffectiveTime() {
        return effectiveTime;
    }

    public void setEffectiveTime(LocalDateTime effectiveTime) {
        this.effectiveTime = effectiveTime;
    }

    public LocalDateTime getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(LocalDateTime expireTime) {
        this.expireTime = expireTime;
    }

    public String getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
    }

    public Integer getUseLimit() {
        return useLimit;
    }

    public void setUseLimit(Integer useLimit) {
        this.useLimit = useLimit;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public void setUsedCount(Integer usedCount) {
        this.usedCount = usedCount;
    }

    public LocalDateTime getLastUseTime() {
        return lastUseTime;
    }

    public void setLastUseTime(LocalDateTime lastUseTime) {
        this.lastUseTime = lastUseTime;
    }

    public String getSendStatus() {
        return sendStatus;
    }

    public void setSendStatus(String sendStatus) {
        this.sendStatus = sendStatus;
    }

    public LocalDateTime getSendTime() {
        return sendTime;
    }

    public void setSendTime(LocalDateTime sendTime) {
        this.sendTime = sendTime;
    }

    public String getSendRequestId() {
        return sendRequestId;
    }

    public void setSendRequestId(String sendRequestId) {
        this.sendRequestId = sendRequestId;
    }

    public String getSendFailReason() {
        return sendFailReason;
    }

    public void setSendFailReason(String sendFailReason) {
        this.sendFailReason = sendFailReason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        LockPassword that = (LockPassword) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(passwordNo, that.passwordNo) &&
                Objects.equals(lockId, that.lockId) &&
                Objects.equals(lockNo, that.lockNo) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(passwordType, that.passwordType) &&
                Objects.equals(password, that.password) &&
                Objects.equals(effectiveTime, that.effectiveTime) &&
                Objects.equals(expireTime, that.expireTime) &&
                Objects.equals(permissionType, that.permissionType) &&
                Objects.equals(useLimit, that.useLimit) &&
                Objects.equals(usedCount, that.usedCount) &&
                Objects.equals(lastUseTime, that.lastUseTime) &&
                Objects.equals(sendStatus, that.sendStatus) &&
                Objects.equals(sendTime, that.sendTime) &&
                Objects.equals(sendRequestId, that.sendRequestId) &&
                Objects.equals(sendFailReason, that.sendFailReason) &&
                Objects.equals(status, that.status) &&
                Objects.equals(createTime, that.createTime) &&
                Objects.equals(updateTime, that.updateTime) &&
                Objects.equals(deleted, that.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, passwordNo, lockId, lockNo, apartmentId, contractId, tenantId, tenantName, passwordType, password, effectiveTime, expireTime, permissionType, useLimit, usedCount, lastUseTime, sendStatus, sendTime, sendRequestId, sendFailReason, status, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "LockPassword{" +
                "id=" + id +
                ", passwordNo='" + passwordNo + '\'' +
                ", lockId=" + lockId +
                ", lockNo='" + lockNo + '\'' +
                ", apartmentId=" + apartmentId +
                ", contractId=" + contractId +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", passwordType='" + passwordType + '\'' +
                ", password='" + password + '\'' +
                ", effectiveTime=" + effectiveTime +
                ", expireTime=" + expireTime +
                ", permissionType='" + permissionType + '\'' +
                ", useLimit=" + useLimit +
                ", usedCount=" + usedCount +
                ", lastUseTime=" + lastUseTime +
                ", sendStatus='" + sendStatus + '\'' +
                ", sendTime=" + sendTime +
                ", sendRequestId='" + sendRequestId + '\'' +
                ", sendFailReason='" + sendFailReason + '\'' +
                ", status='" + status + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
