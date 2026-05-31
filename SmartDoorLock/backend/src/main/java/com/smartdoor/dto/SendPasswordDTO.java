package com.smartdoor.dto;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

public class SendPasswordDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long lockId;
    private Long contractId;
    private Long tenantId;
    private String tenantName;
    private String passwordType;
    private String permissionType;
    private LocalDateTime effectiveTime;
    private LocalDateTime expireTime;
    private Integer useLimit;
    private String remark;

    public Long getLockId() {
        return lockId;
    }

    public void setLockId(Long lockId) {
        this.lockId = lockId;
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

    public String getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
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

    public Integer getUseLimit() {
        return useLimit;
    }

    public void setUseLimit(Integer useLimit) {
        this.useLimit = useLimit;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SendPasswordDTO that = (SendPasswordDTO) o;
        return Objects.equals(lockId, that.lockId) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(passwordType, that.passwordType) &&
                Objects.equals(permissionType, that.permissionType) &&
                Objects.equals(effectiveTime, that.effectiveTime) &&
                Objects.equals(expireTime, that.expireTime) &&
                Objects.equals(useLimit, that.useLimit) &&
                Objects.equals(remark, that.remark);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lockId, contractId, tenantId, tenantName, passwordType, permissionType, effectiveTime, expireTime, useLimit, remark);
    }

    @Override
    public String toString() {
        return "SendPasswordDTO{" +
                "lockId=" + lockId +
                ", contractId=" + contractId +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", passwordType='" + passwordType + '\'' +
                ", permissionType='" + permissionType + '\'' +
                ", effectiveTime=" + effectiveTime +
                ", expireTime=" + expireTime +
                ", useLimit=" + useLimit +
                ", remark='" + remark + '\'' +
                '}';
    }
}
