package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("utility_record")
public class UtilityRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String recordNo;

    private Long contractId;

    private Long apartmentId;

    private String apartmentNo;

    private String recordMonth;

    private LocalDate recordDate;

    private BigDecimal lastWaterReading;

    private BigDecimal currentWaterReading;

    private BigDecimal waterConsumption;

    private BigDecimal waterUnitPrice;

    private BigDecimal waterFee;

    private BigDecimal lastElectricityReading;

    private BigDecimal currentElectricityReading;

    private BigDecimal electricityConsumption;

    private BigDecimal electricityUnitPrice;

    private BigDecimal electricityFee;

    private Long readerId;

    private String readerName;

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

    public String getRecordMonth() {
        return recordMonth;
    }

    public void setRecordMonth(String recordMonth) {
        this.recordMonth = recordMonth;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public BigDecimal getLastWaterReading() {
        return lastWaterReading;
    }

    public void setLastWaterReading(BigDecimal lastWaterReading) {
        this.lastWaterReading = lastWaterReading;
    }

    public BigDecimal getCurrentWaterReading() {
        return currentWaterReading;
    }

    public void setCurrentWaterReading(BigDecimal currentWaterReading) {
        this.currentWaterReading = currentWaterReading;
    }

    public BigDecimal getWaterConsumption() {
        return waterConsumption;
    }

    public void setWaterConsumption(BigDecimal waterConsumption) {
        this.waterConsumption = waterConsumption;
    }

    public BigDecimal getWaterUnitPrice() {
        return waterUnitPrice;
    }

    public void setWaterUnitPrice(BigDecimal waterUnitPrice) {
        this.waterUnitPrice = waterUnitPrice;
    }

    public BigDecimal getWaterFee() {
        return waterFee;
    }

    public void setWaterFee(BigDecimal waterFee) {
        this.waterFee = waterFee;
    }

    public BigDecimal getLastElectricityReading() {
        return lastElectricityReading;
    }

    public void setLastElectricityReading(BigDecimal lastElectricityReading) {
        this.lastElectricityReading = lastElectricityReading;
    }

    public BigDecimal getCurrentElectricityReading() {
        return currentElectricityReading;
    }

    public void setCurrentElectricityReading(BigDecimal currentElectricityReading) {
        this.currentElectricityReading = currentElectricityReading;
    }

    public BigDecimal getElectricityConsumption() {
        return electricityConsumption;
    }

    public void setElectricityConsumption(BigDecimal electricityConsumption) {
        this.electricityConsumption = electricityConsumption;
    }

    public BigDecimal getElectricityUnitPrice() {
        return electricityUnitPrice;
    }

    public void setElectricityUnitPrice(BigDecimal electricityUnitPrice) {
        this.electricityUnitPrice = electricityUnitPrice;
    }

    public BigDecimal getElectricityFee() {
        return electricityFee;
    }

    public void setElectricityFee(BigDecimal electricityFee) {
        this.electricityFee = electricityFee;
    }

    public Long getReaderId() {
        return readerId;
    }

    public void setReaderId(Long readerId) {
        this.readerId = readerId;
    }

    public String getReaderName() {
        return readerName;
    }

    public void setReaderName(String readerName) {
        this.readerName = readerName;
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
        UtilityRecord that = (UtilityRecord) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(recordNo, that.recordNo) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(recordMonth, that.recordMonth) &&
                Objects.equals(recordDate, that.recordDate) &&
                Objects.equals(lastWaterReading, that.lastWaterReading) &&
                Objects.equals(currentWaterReading, that.currentWaterReading) &&
                Objects.equals(waterConsumption, that.waterConsumption) &&
                Objects.equals(waterUnitPrice, that.waterUnitPrice) &&
                Objects.equals(waterFee, that.waterFee) &&
                Objects.equals(lastElectricityReading, that.lastElectricityReading) &&
                Objects.equals(currentElectricityReading, that.currentElectricityReading) &&
                Objects.equals(electricityConsumption, that.electricityConsumption) &&
                Objects.equals(electricityUnitPrice, that.electricityUnitPrice) &&
                Objects.equals(electricityFee, that.electricityFee) &&
                Objects.equals(readerId, that.readerId) &&
                Objects.equals(readerName, that.readerName) &&
                Objects.equals(remark, that.remark) &&
                Objects.equals(createTime, that.createTime) &&
                Objects.equals(updateTime, that.updateTime) &&
                Objects.equals(deleted, that.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, recordNo, contractId, apartmentId, apartmentNo, recordMonth, recordDate, lastWaterReading, currentWaterReading, waterConsumption, waterUnitPrice, waterFee, lastElectricityReading, currentElectricityReading, electricityConsumption, electricityUnitPrice, electricityFee, readerId, readerName, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "UtilityRecord{" +
                "id=" + id +
                ", recordNo='" + recordNo + '\'' +
                ", contractId=" + contractId +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", recordMonth='" + recordMonth + '\'' +
                ", recordDate=" + recordDate +
                ", lastWaterReading=" + lastWaterReading +
                ", currentWaterReading=" + currentWaterReading +
                ", waterConsumption=" + waterConsumption +
                ", waterUnitPrice=" + waterUnitPrice +
                ", waterFee=" + waterFee +
                ", lastElectricityReading=" + lastElectricityReading +
                ", currentElectricityReading=" + currentElectricityReading +
                ", electricityConsumption=" + electricityConsumption +
                ", electricityUnitPrice=" + electricityUnitPrice +
                ", electricityFee=" + electricityFee +
                ", readerId=" + readerId +
                ", readerName='" + readerName + '\'' +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
