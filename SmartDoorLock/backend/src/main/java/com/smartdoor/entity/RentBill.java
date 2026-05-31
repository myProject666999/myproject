package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("rent_bill")
public class RentBill implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String billNo;

    private Long contractId;

    private String contractNo;

    private Long tenantId;

    private String tenantName;

    private Long apartmentId;

    private String apartmentNo;

    private String billMonth;

    private LocalDate billStartDate;

    private LocalDate billEndDate;

    private BigDecimal rentAmount;

    private BigDecimal waterFee;

    private BigDecimal electricityFee;

    private BigDecimal gasFee;

    private BigDecimal propertyFee;

    private BigDecimal networkFee;

    private BigDecimal otherFee;

    private BigDecimal lateFee;

    private BigDecimal totalAmount;

    private BigDecimal paidAmount;

    private BigDecimal unpaidAmount;

    private LocalDate dueDate;

    private LocalDateTime paymentTime;

    private String paymentMethod;

    private String paymentTransactionNo;

    private String status;

    private Integer reminderCount;

    private LocalDateTime lastReminderTime;

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

    public String getBillNo() {
        return billNo;
    }

    public void setBillNo(String billNo) {
        this.billNo = billNo;
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

    public String getBillMonth() {
        return billMonth;
    }

    public void setBillMonth(String billMonth) {
        this.billMonth = billMonth;
    }

    public LocalDate getBillStartDate() {
        return billStartDate;
    }

    public void setBillStartDate(LocalDate billStartDate) {
        this.billStartDate = billStartDate;
    }

    public LocalDate getBillEndDate() {
        return billEndDate;
    }

    public void setBillEndDate(LocalDate billEndDate) {
        this.billEndDate = billEndDate;
    }

    public BigDecimal getRentAmount() {
        return rentAmount;
    }

    public void setRentAmount(BigDecimal rentAmount) {
        this.rentAmount = rentAmount;
    }

    public BigDecimal getWaterFee() {
        return waterFee;
    }

    public void setWaterFee(BigDecimal waterFee) {
        this.waterFee = waterFee;
    }

    public BigDecimal getElectricityFee() {
        return electricityFee;
    }

    public void setElectricityFee(BigDecimal electricityFee) {
        this.electricityFee = electricityFee;
    }

    public BigDecimal getGasFee() {
        return gasFee;
    }

    public void setGasFee(BigDecimal gasFee) {
        this.gasFee = gasFee;
    }

    public BigDecimal getPropertyFee() {
        return propertyFee;
    }

    public void setPropertyFee(BigDecimal propertyFee) {
        this.propertyFee = propertyFee;
    }

    public BigDecimal getNetworkFee() {
        return networkFee;
    }

    public void setNetworkFee(BigDecimal networkFee) {
        this.networkFee = networkFee;
    }

    public BigDecimal getOtherFee() {
        return otherFee;
    }

    public void setOtherFee(BigDecimal otherFee) {
        this.otherFee = otherFee;
    }

    public BigDecimal getLateFee() {
        return lateFee;
    }

    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getUnpaidAmount() {
        return unpaidAmount;
    }

    public void setUnpaidAmount(BigDecimal unpaidAmount) {
        this.unpaidAmount = unpaidAmount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDateTime getPaymentTime() {
        return paymentTime;
    }

    public void setPaymentTime(LocalDateTime paymentTime) {
        this.paymentTime = paymentTime;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentTransactionNo() {
        return paymentTransactionNo;
    }

    public void setPaymentTransactionNo(String paymentTransactionNo) {
        this.paymentTransactionNo = paymentTransactionNo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getReminderCount() {
        return reminderCount;
    }

    public void setReminderCount(Integer reminderCount) {
        this.reminderCount = reminderCount;
    }

    public LocalDateTime getLastReminderTime() {
        return lastReminderTime;
    }

    public void setLastReminderTime(LocalDateTime lastReminderTime) {
        this.lastReminderTime = lastReminderTime;
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
        RentBill rentBill = (RentBill) o;
        return Objects.equals(id, rentBill.id) &&
                Objects.equals(billNo, rentBill.billNo) &&
                Objects.equals(contractId, rentBill.contractId) &&
                Objects.equals(contractNo, rentBill.contractNo) &&
                Objects.equals(tenantId, rentBill.tenantId) &&
                Objects.equals(tenantName, rentBill.tenantName) &&
                Objects.equals(apartmentId, rentBill.apartmentId) &&
                Objects.equals(apartmentNo, rentBill.apartmentNo) &&
                Objects.equals(billMonth, rentBill.billMonth) &&
                Objects.equals(billStartDate, rentBill.billStartDate) &&
                Objects.equals(billEndDate, rentBill.billEndDate) &&
                Objects.equals(rentAmount, rentBill.rentAmount) &&
                Objects.equals(waterFee, rentBill.waterFee) &&
                Objects.equals(electricityFee, rentBill.electricityFee) &&
                Objects.equals(gasFee, rentBill.gasFee) &&
                Objects.equals(propertyFee, rentBill.propertyFee) &&
                Objects.equals(networkFee, rentBill.networkFee) &&
                Objects.equals(otherFee, rentBill.otherFee) &&
                Objects.equals(lateFee, rentBill.lateFee) &&
                Objects.equals(totalAmount, rentBill.totalAmount) &&
                Objects.equals(paidAmount, rentBill.paidAmount) &&
                Objects.equals(unpaidAmount, rentBill.unpaidAmount) &&
                Objects.equals(dueDate, rentBill.dueDate) &&
                Objects.equals(paymentTime, rentBill.paymentTime) &&
                Objects.equals(paymentMethod, rentBill.paymentMethod) &&
                Objects.equals(paymentTransactionNo, rentBill.paymentTransactionNo) &&
                Objects.equals(status, rentBill.status) &&
                Objects.equals(reminderCount, rentBill.reminderCount) &&
                Objects.equals(lastReminderTime, rentBill.lastReminderTime) &&
                Objects.equals(remark, rentBill.remark) &&
                Objects.equals(createTime, rentBill.createTime) &&
                Objects.equals(updateTime, rentBill.updateTime) &&
                Objects.equals(deleted, rentBill.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, billNo, contractId, contractNo, tenantId, tenantName, apartmentId, apartmentNo, billMonth, billStartDate, billEndDate, rentAmount, waterFee, electricityFee, gasFee, propertyFee, networkFee, otherFee, lateFee, totalAmount, paidAmount, unpaidAmount, dueDate, paymentTime, paymentMethod, paymentTransactionNo, status, reminderCount, lastReminderTime, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "RentBill{" +
                "id=" + id +
                ", billNo='" + billNo + '\'' +
                ", contractId=" + contractId +
                ", contractNo='" + contractNo + '\'' +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", billMonth='" + billMonth + '\'' +
                ", billStartDate=" + billStartDate +
                ", billEndDate=" + billEndDate +
                ", rentAmount=" + rentAmount +
                ", waterFee=" + waterFee +
                ", electricityFee=" + electricityFee +
                ", gasFee=" + gasFee +
                ", propertyFee=" + propertyFee +
                ", networkFee=" + networkFee +
                ", otherFee=" + otherFee +
                ", lateFee=" + lateFee +
                ", totalAmount=" + totalAmount +
                ", paidAmount=" + paidAmount +
                ", unpaidAmount=" + unpaidAmount +
                ", dueDate=" + dueDate +
                ", paymentTime=" + paymentTime +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentTransactionNo='" + paymentTransactionNo + '\'' +
                ", status='" + status + '\'' +
                ", reminderCount=" + reminderCount +
                ", lastReminderTime=" + lastReminderTime +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
