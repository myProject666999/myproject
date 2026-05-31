package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("check_out_settlement")
public class CheckOutSettlement implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String settlementNo;

    private Long contractId;

    private String contractNo;

    private Long tenantId;

    private String tenantName;

    private Long apartmentId;

    private String apartmentNo;

    private LocalDate checkOutDate;

    private LocalDate settlementDate;

    private BigDecimal depositAmount;

    private BigDecimal rentSettlement;

    private BigDecimal waterSettlement;

    private BigDecimal electricitySettlement;

    private BigDecimal gasSettlement;

    private BigDecimal propertySettlement;

    private BigDecimal repairFee;

    private BigDecimal cleaningFee;

    private BigDecimal keyDeposit;

    private BigDecimal compensationFee;

    private BigDecimal otherDeduction;

    private BigDecimal otherRefund;

    private BigDecimal totalDeduction;

    private BigDecimal totalRefund;

    private BigDecimal actualRefund;

    private String refundMethod;

    private String refundTransactionNo;

    private LocalDateTime refundTime;

    private String settlementDetail;

    private String status;

    private Long operatorId;

    private String operatorName;

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

    public String getSettlementNo() {
        return settlementNo;
    }

    public void setSettlementNo(String settlementNo) {
        this.settlementNo = settlementNo;
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

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public LocalDate getSettlementDate() {
        return settlementDate;
    }

    public void setSettlementDate(LocalDate settlementDate) {
        this.settlementDate = settlementDate;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount;
    }

    public BigDecimal getRentSettlement() {
        return rentSettlement;
    }

    public void setRentSettlement(BigDecimal rentSettlement) {
        this.rentSettlement = rentSettlement;
    }

    public BigDecimal getWaterSettlement() {
        return waterSettlement;
    }

    public void setWaterSettlement(BigDecimal waterSettlement) {
        this.waterSettlement = waterSettlement;
    }

    public BigDecimal getElectricitySettlement() {
        return electricitySettlement;
    }

    public void setElectricitySettlement(BigDecimal electricitySettlement) {
        this.electricitySettlement = electricitySettlement;
    }

    public BigDecimal getGasSettlement() {
        return gasSettlement;
    }

    public void setGasSettlement(BigDecimal gasSettlement) {
        this.gasSettlement = gasSettlement;
    }

    public BigDecimal getPropertySettlement() {
        return propertySettlement;
    }

    public void setPropertySettlement(BigDecimal propertySettlement) {
        this.propertySettlement = propertySettlement;
    }

    public BigDecimal getRepairFee() {
        return repairFee;
    }

    public void setRepairFee(BigDecimal repairFee) {
        this.repairFee = repairFee;
    }

    public BigDecimal getCleaningFee() {
        return cleaningFee;
    }

    public void setCleaningFee(BigDecimal cleaningFee) {
        this.cleaningFee = cleaningFee;
    }

    public BigDecimal getKeyDeposit() {
        return keyDeposit;
    }

    public void setKeyDeposit(BigDecimal keyDeposit) {
        this.keyDeposit = keyDeposit;
    }

    public BigDecimal getCompensationFee() {
        return compensationFee;
    }

    public void setCompensationFee(BigDecimal compensationFee) {
        this.compensationFee = compensationFee;
    }

    public BigDecimal getOtherDeduction() {
        return otherDeduction;
    }

    public void setOtherDeduction(BigDecimal otherDeduction) {
        this.otherDeduction = otherDeduction;
    }

    public BigDecimal getOtherRefund() {
        return otherRefund;
    }

    public void setOtherRefund(BigDecimal otherRefund) {
        this.otherRefund = otherRefund;
    }

    public BigDecimal getTotalDeduction() {
        return totalDeduction;
    }

    public void setTotalDeduction(BigDecimal totalDeduction) {
        this.totalDeduction = totalDeduction;
    }

    public BigDecimal getTotalRefund() {
        return totalRefund;
    }

    public void setTotalRefund(BigDecimal totalRefund) {
        this.totalRefund = totalRefund;
    }

    public BigDecimal getActualRefund() {
        return actualRefund;
    }

    public void setActualRefund(BigDecimal actualRefund) {
        this.actualRefund = actualRefund;
    }

    public String getRefundMethod() {
        return refundMethod;
    }

    public void setRefundMethod(String refundMethod) {
        this.refundMethod = refundMethod;
    }

    public String getRefundTransactionNo() {
        return refundTransactionNo;
    }

    public void setRefundTransactionNo(String refundTransactionNo) {
        this.refundTransactionNo = refundTransactionNo;
    }

    public LocalDateTime getRefundTime() {
        return refundTime;
    }

    public void setRefundTime(LocalDateTime refundTime) {
        this.refundTime = refundTime;
    }

    public String getSettlementDetail() {
        return settlementDetail;
    }

    public void setSettlementDetail(String settlementDetail) {
        this.settlementDetail = settlementDetail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        CheckOutSettlement that = (CheckOutSettlement) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(settlementNo, that.settlementNo) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(contractNo, that.contractNo) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(checkOutDate, that.checkOutDate) &&
                Objects.equals(settlementDate, that.settlementDate) &&
                Objects.equals(depositAmount, that.depositAmount) &&
                Objects.equals(rentSettlement, that.rentSettlement) &&
                Objects.equals(waterSettlement, that.waterSettlement) &&
                Objects.equals(electricitySettlement, that.electricitySettlement) &&
                Objects.equals(gasSettlement, that.gasSettlement) &&
                Objects.equals(propertySettlement, that.propertySettlement) &&
                Objects.equals(repairFee, that.repairFee) &&
                Objects.equals(cleaningFee, that.cleaningFee) &&
                Objects.equals(keyDeposit, that.keyDeposit) &&
                Objects.equals(compensationFee, that.compensationFee) &&
                Objects.equals(otherDeduction, that.otherDeduction) &&
                Objects.equals(otherRefund, that.otherRefund) &&
                Objects.equals(totalDeduction, that.totalDeduction) &&
                Objects.equals(totalRefund, that.totalRefund) &&
                Objects.equals(actualRefund, that.actualRefund) &&
                Objects.equals(refundMethod, that.refundMethod) &&
                Objects.equals(refundTransactionNo, that.refundTransactionNo) &&
                Objects.equals(refundTime, that.refundTime) &&
                Objects.equals(settlementDetail, that.settlementDetail) &&
                Objects.equals(status, that.status) &&
                Objects.equals(operatorId, that.operatorId) &&
                Objects.equals(operatorName, that.operatorName) &&
                Objects.equals(remark, that.remark) &&
                Objects.equals(createTime, that.createTime) &&
                Objects.equals(updateTime, that.updateTime) &&
                Objects.equals(deleted, that.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, settlementNo, contractId, contractNo, tenantId, tenantName, apartmentId, apartmentNo, checkOutDate, settlementDate, depositAmount, rentSettlement, waterSettlement, electricitySettlement, gasSettlement, propertySettlement, repairFee, cleaningFee, keyDeposit, compensationFee, otherDeduction, otherRefund, totalDeduction, totalRefund, actualRefund, refundMethod, refundTransactionNo, refundTime, settlementDetail, status, operatorId, operatorName, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "CheckOutSettlement{" +
                "id=" + id +
                ", settlementNo='" + settlementNo + '\'' +
                ", contractId=" + contractId +
                ", contractNo='" + contractNo + '\'' +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", checkOutDate=" + checkOutDate +
                ", settlementDate=" + settlementDate +
                ", depositAmount=" + depositAmount +
                ", rentSettlement=" + rentSettlement +
                ", waterSettlement=" + waterSettlement +
                ", electricitySettlement=" + electricitySettlement +
                ", gasSettlement=" + gasSettlement +
                ", propertySettlement=" + propertySettlement +
                ", repairFee=" + repairFee +
                ", cleaningFee=" + cleaningFee +
                ", keyDeposit=" + keyDeposit +
                ", compensationFee=" + compensationFee +
                ", otherDeduction=" + otherDeduction +
                ", otherRefund=" + otherRefund +
                ", totalDeduction=" + totalDeduction +
                ", totalRefund=" + totalRefund +
                ", actualRefund=" + actualRefund +
                ", refundMethod='" + refundMethod + '\'' +
                ", refundTransactionNo='" + refundTransactionNo + '\'' +
                ", refundTime=" + refundTime +
                ", settlementDetail='" + settlementDetail + '\'' +
                ", status='" + status + '\'' +
                ", operatorId=" + operatorId +
                ", operatorName='" + operatorName + '\'' +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
