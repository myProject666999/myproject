package com.smartdoor.dto;

import com.smartdoor.common.PageQuery;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

public class LockPasswordQueryDTO extends PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private String passwordNo;
    private Long lockId;
    private String lockNo;
    private Long apartmentId;
    private Long contractId;
    private Long tenantId;
    private String passwordType;
    private String permissionType;
    private String sendStatus;
    private String status;
    private LocalDateTime effectiveTimeStart;
    private LocalDateTime effectiveTimeEnd;
    private LocalDateTime expireTimeStart;
    private LocalDateTime expireTimeEnd;

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

    public String getSendStatus() {
        return sendStatus;
    }

    public void setSendStatus(String sendStatus) {
        this.sendStatus = sendStatus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getEffectiveTimeStart() {
        return effectiveTimeStart;
    }

    public void setEffectiveTimeStart(LocalDateTime effectiveTimeStart) {
        this.effectiveTimeStart = effectiveTimeStart;
    }

    public LocalDateTime getEffectiveTimeEnd() {
        return effectiveTimeEnd;
    }

    public void setEffectiveTimeEnd(LocalDateTime effectiveTimeEnd) {
        this.effectiveTimeEnd = effectiveTimeEnd;
    }

    public LocalDateTime getExpireTimeStart() {
        return expireTimeStart;
    }

    public void setExpireTimeStart(LocalDateTime expireTimeStart) {
        this.expireTimeStart = expireTimeStart;
    }

    public LocalDateTime getExpireTimeEnd() {
        return expireTimeEnd;
    }

    public void setExpireTimeEnd(LocalDateTime expireTimeEnd) {
        this.expireTimeEnd = expireTimeEnd;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        LockPasswordQueryDTO that = (LockPasswordQueryDTO) o;
        return Objects.equals(passwordNo, that.passwordNo) &&
                Objects.equals(lockId, that.lockId) &&
                Objects.equals(lockNo, that.lockNo) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(passwordType, that.passwordType) &&
                Objects.equals(permissionType, that.permissionType) &&
                Objects.equals(sendStatus, that.sendStatus) &&
                Objects.equals(status, that.status) &&
                Objects.equals(effectiveTimeStart, that.effectiveTimeStart) &&
                Objects.equals(effectiveTimeEnd, that.effectiveTimeEnd) &&
                Objects.equals(expireTimeStart, that.expireTimeStart) &&
                Objects.equals(expireTimeEnd, that.expireTimeEnd);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), passwordNo, lockId, lockNo, apartmentId, contractId, tenantId, passwordType, permissionType, sendStatus, status, effectiveTimeStart, effectiveTimeEnd, expireTimeStart, expireTimeEnd);
    }

    @Override
    public String toString() {
        return "LockPasswordQueryDTO{" +
                "passwordNo='" + passwordNo + '\'' +
                ", lockId=" + lockId +
                ", lockNo='" + lockNo + '\'' +
                ", apartmentId=" + apartmentId +
                ", contractId=" + contractId +
                ", tenantId=" + tenantId +
                ", passwordType='" + passwordType + '\'' +
                ", permissionType='" + permissionType + '\'' +
                ", sendStatus='" + sendStatus + '\'' +
                ", status='" + status + '\'' +
                ", effectiveTimeStart=" + effectiveTimeStart +
                ", effectiveTimeEnd=" + effectiveTimeEnd +
                ", expireTimeStart=" + expireTimeStart +
                ", expireTimeEnd=" + expireTimeEnd +
                '}';
    }
}
