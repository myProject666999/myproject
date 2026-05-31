package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("check_in_record")
public class CheckInRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String recordNo;

    private Long contractId;

    private String contractNo;

    private Long tenantId;

    private String tenantName;

    private Long apartmentId;

    private String apartmentNo;

    private String recordType;

    private LocalDate recordDate;

    private LocalDateTime recordTime;

    private Long operatorId;

    private String operatorName;

    private BigDecimal waterMeterReading;

    private BigDecimal electricityMeterReading;

    private BigDecimal gasMeterReading;

    private Integer keyCount;

    private Integer doorCardCount;

    private String checkItems;

    private String checkResult;

    private String damageDescription;

    private String signatureImage;

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

    public String getRecordNo() {
        return recordNo;
    }

    public void setRecordNo(String recordNo) {
        this.recordNo = recordNo;
    }

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public String getContractNo() {
        return contractNo;
    }

    public void setContractNo(String contractNo) {
        this.contractNo = contractNo;
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

    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public LocalDateTime getRecordTime() {
        return recordTime;
    }

    public void setRecordTime(LocalDateTime recordTime) {
        this.recordTime = recordTime;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public BigDecimal getWaterMeterReading() {
        return waterMeterReading;
    }

    public void setWaterMeterReading(BigDecimal waterMeterReading) {
        this.waterMeterReading = waterMeterReading;
    }

    public BigDecimal getElectricityMeterReading() {
        return electricityMeterReading;
    }

    public void setElectricityMeterReading(BigDecimal electricityMeterReading) {
        this.electricityMeterReading = electricityMeterReading;
    }

    public BigDecimal getGasMeterReading() {
        return gasMeterReading;
    }

    public void setGasMeterReading(BigDecimal gasMeterReading) {
        this.gasMeterReading = gasMeterReading;
    }

    public Integer getKeyCount() {
        return keyCount;
    }

    public void setKeyCount(Integer keyCount) {
        this.keyCount = keyCount;
    }

    public Integer getDoorCardCount() {
        return doorCardCount;
    }

    public void setDoorCardCount(Integer doorCardCount) {
        this.doorCardCount = doorCardCount;
    }

    public String getCheckItems() {
        return checkItems;
    }

    public void setCheckItems(String checkItems) {
        this.checkItems = checkItems;
    }

    public String getCheckResult() {
        return checkResult;
    }

    public void setCheckResult(String checkResult) {
        this.checkResult = checkResult;
    }

    public String getDamageDescription() {
        return damageDescription;
    }

    public void setDamageDescription(String damageDescription) {
        this.damageDescription = damageDescription;
    }

    public String getSignatureImage() {
        return signatureImage;
    }

    public void setSignatureImage(String signatureImage) {
        this.signatureImage = signatureImage;
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
        CheckInRecord that = (CheckInRecord) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(recordNo, that.recordNo) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(contractNo, that.contractNo) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(recordType, that.recordType) &&
                Objects.equals(recordDate, that.recordDate) &&
                Objects.equals(recordTime, that.recordTime) &&
                Objects.equals(operatorId, that.operatorId) &&
                Objects.equals(operatorName, that.operatorName) &&
                Objects.equals(waterMeterReading, that.waterMeterReading) &&
                Objects.equals(electricityMeterReading, that.electricityMeterReading) &&
                Objects.equals(gasMeterReading, that.gasMeterReading) &&
                Objects.equals(keyCount, that.keyCount) &&
                Objects.equals(doorCardCount, that.doorCardCount) &&
                Objects.equals(checkItems, that.checkItems) &&
                Objects.equals(checkResult, that.checkResult) &&
                Objects.equals(damageDescription, that.damageDescription) &&
                Objects.equals(signatureImage, that.signatureImage) &&
                Objects.equals(remark, that.remark) &&
                Objects.equals(createTime, that.createTime) &&
                Objects.equals(updateTime, that.updateTime) &&
                Objects.equals(deleted, that.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, recordNo, contractId, contractNo, tenantId, tenantName, apartmentId, apartmentNo, recordType, recordDate, recordTime, operatorId, operatorName, waterMeterReading, electricityMeterReading, gasMeterReading, keyCount, doorCardCount, checkItems, checkResult, damageDescription, signatureImage, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "CheckInRecord{" +
                "id=" + id +
                ", recordNo='" + recordNo + '\'' +
                ", contractId=" + contractId +
                ", contractNo='" + contractNo + '\'' +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", recordType='" + recordType + '\'' +
                ", recordDate=" + recordDate +
                ", recordTime=" + recordTime +
                ", operatorId=" + operatorId +
                ", operatorName='" + operatorName + '\'' +
                ", waterMeterReading=" + waterMeterReading +
                ", electricityMeterReading=" + electricityMeterReading +
                ", gasMeterReading=" + gasMeterReading +
                ", keyCount=" + keyCount +
                ", doorCardCount=" + doorCardCount +
                ", checkItems='" + checkItems + '\'' +
                ", checkResult='" + checkResult + '\'' +
                ", damageDescription='" + damageDescription + '\'' +
                ", signatureImage='" + signatureImage + '\'' +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
