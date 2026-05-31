package com.smartdoor.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

public class CheckOutSettlementDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long contractId;
    private LocalDate checkOutDate;
    private BigDecimal waterSettlement;
    private BigDecimal electricitySettlement;
    private BigDecimal gasSettlement;
    private BigDecimal repairFee;
    private BigDecimal cleaningFee;
    private BigDecimal compensationFee;
    private BigDecimal otherDeduction;
    private BigDecimal otherRefund;
    private String settlementDetail;
    private String remark;

    public Long getContractId() {
        return contractId;
    }

    public void setContractId(Long contractId) {
        this.contractId = contractId;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
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

    public String getSettlementDetail() {
        return settlementDetail;
    }

    public void setSettlementDetail(String settlementDetail) {
        this.settlementDetail = settlementDetail;
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
        CheckOutSettlementDTO that = (CheckOutSettlementDTO) o;
        return Objects.equals(contractId, that.contractId) &&
                Objects.equals(checkOutDate, that.checkOutDate) &&
                Objects.equals(waterSettlement, that.waterSettlement) &&
                Objects.equals(electricitySettlement, that.electricitySettlement) &&
                Objects.equals(gasSettlement, that.gasSettlement) &&
                Objects.equals(repairFee, that.repairFee) &&
                Objects.equals(cleaningFee, that.cleaningFee) &&
                Objects.equals(compensationFee, that.compensationFee) &&
                Objects.equals(otherDeduction, that.otherDeduction) &&
                Objects.equals(otherRefund, that.otherRefund) &&
                Objects.equals(settlementDetail, that.settlementDetail) &&
                Objects.equals(remark, that.remark);
    }

    @Override
    public int hashCode() {
        return Objects.hash(contractId, checkOutDate, waterSettlement, electricitySettlement, gasSettlement, repairFee, cleaningFee, compensationFee, otherDeduction, otherRefund, settlementDetail, remark);
    }

    @Override
    public String toString() {
        return "CheckOutSettlementDTO{" +
                "contractId=" + contractId +
                ", checkOutDate=" + checkOutDate +
                ", waterSettlement=" + waterSettlement +
                ", electricitySettlement=" + electricitySettlement +
                ", gasSettlement=" + gasSettlement +
                ", repairFee=" + repairFee +
                ", cleaningFee=" + cleaningFee +
                ", compensationFee=" + compensationFee +
                ", otherDeduction=" + otherDeduction +
                ", otherRefund=" + otherRefund +
                ", settlementDetail='" + settlementDetail + '\'' +
                ", remark='" + remark + '\'' +
                '}';
    }
}
