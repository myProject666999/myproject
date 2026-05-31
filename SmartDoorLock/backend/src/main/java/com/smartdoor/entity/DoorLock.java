package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("door_lock")
public class DoorLock implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String lockNo;

    private String lockModel;

    private String lockBrand;

    private Long apartmentId;

    private String apartmentNo;

    private LocalDateTime installTime;

    private LocalDateTime lastMaintainTime;

    private Integer batteryLevel;

    private String networkStatus;

    private String lockStatus;

    private Integer status;

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

    public String getLockNo() {
        return lockNo;
    }

    public void setLockNo(String lockNo) {
        this.lockNo = lockNo;
    }

    public String getLockModel() {
        return lockModel;
    }

    public void setLockModel(String lockModel) {
        this.lockModel = lockModel;
    }

    public String getLockBrand() {
        return lockBrand;
    }

    public void setLockBrand(String lockBrand) {
        this.lockBrand = lockBrand;
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

    public LocalDateTime getInstallTime() {
        return installTime;
    }

    public void setInstallTime(LocalDateTime installTime) {
        this.installTime = installTime;
    }

    public LocalDateTime getLastMaintainTime() {
        return lastMaintainTime;
    }

    public void setLastMaintainTime(LocalDateTime lastMaintainTime) {
        this.lastMaintainTime = lastMaintainTime;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public String getNetworkStatus() {
        return networkStatus;
    }

    public void setNetworkStatus(String networkStatus) {
        this.networkStatus = networkStatus;
    }

    public String getLockStatus() {
        return lockStatus;
    }

    public void setLockStatus(String lockStatus) {
        this.lockStatus = lockStatus;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
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
        DoorLock doorLock = (DoorLock) o;
        return Objects.equals(id, doorLock.id) &&
                Objects.equals(lockNo, doorLock.lockNo) &&
                Objects.equals(lockModel, doorLock.lockModel) &&
                Objects.equals(lockBrand, doorLock.lockBrand) &&
                Objects.equals(apartmentId, doorLock.apartmentId) &&
                Objects.equals(apartmentNo, doorLock.apartmentNo) &&
                Objects.equals(installTime, doorLock.installTime) &&
                Objects.equals(lastMaintainTime, doorLock.lastMaintainTime) &&
                Objects.equals(batteryLevel, doorLock.batteryLevel) &&
                Objects.equals(networkStatus, doorLock.networkStatus) &&
                Objects.equals(lockStatus, doorLock.lockStatus) &&
                Objects.equals(status, doorLock.status) &&
                Objects.equals(remark, doorLock.remark) &&
                Objects.equals(createTime, doorLock.createTime) &&
                Objects.equals(updateTime, doorLock.updateTime) &&
                Objects.equals(deleted, doorLock.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, lockNo, lockModel, lockBrand, apartmentId, apartmentNo, installTime, lastMaintainTime, batteryLevel, networkStatus, lockStatus, status, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "DoorLock{" +
                "id=" + id +
                ", lockNo='" + lockNo + '\'' +
                ", lockModel='" + lockModel + '\'' +
                ", lockBrand='" + lockBrand + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", installTime=" + installTime +
                ", lastMaintainTime=" + lastMaintainTime +
                ", batteryLevel=" + batteryLevel +
                ", networkStatus='" + networkStatus + '\'' +
                ", lockStatus='" + lockStatus + '\'' +
                ", status=" + status +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
