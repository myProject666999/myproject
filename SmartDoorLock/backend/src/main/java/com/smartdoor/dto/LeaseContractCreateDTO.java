package com.smartdoor.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

public class LeaseContractCreateDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long tenantId;
    private Long apartmentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyRent;
    private BigDecimal deposit;
    private String paymentMethod;
    private Integer paymentDay;
    private BigDecimal waterPrice;
    private BigDecimal electricityPrice;
    private LocalDate signingDate;
    private String remark;

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getMonthlyRent() {
        return monthlyRent;
    }

    public void setMonthlyRent(BigDecimal monthlyRent) {
        this.monthlyRent = monthlyRent;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Integer getPaymentDay() {
        return paymentDay;
    }

    public void setPaymentDay(Integer paymentDay) {
        this.paymentDay = paymentDay;
    }

    public BigDecimal getWaterPrice() {
        return waterPrice;
    }

    public void setWaterPrice(BigDecimal waterPrice) {
        this.waterPrice = waterPrice;
    }

    public BigDecimal getElectricityPrice() {
        return electricityPrice;
    }

    public void setElectricityPrice(BigDecimal electricityPrice) {
        this.electricityPrice = electricityPrice;
    }

    public LocalDate getSigningDate() {
        return signingDate;
    }

    public void setSigningDate(LocalDate signingDate) {
        this.signingDate = signingDate;
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
        LeaseContractCreateDTO that = (LeaseContractCreateDTO) o;
        return Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(startDate, that.startDate) &&
                Objects.equals(endDate, that.endDate) &&
                Objects.equals(monthlyRent, that.monthlyRent) &&
                Objects.equals(deposit, that.deposit) &&
                Objects.equals(paymentMethod, that.paymentMethod) &&
                Objects.equals(paymentDay, that.paymentDay) &&
                Objects.equals(waterPrice, that.waterPrice) &&
                Objects.equals(electricityPrice, that.electricityPrice) &&
                Objects.equals(signingDate, that.signingDate) &&
                Objects.equals(remark, that.remark);
    }

    @Override
    public int hashCode() {
        return Objects.hash(tenantId, apartmentId, startDate, endDate, monthlyRent, deposit, paymentMethod, paymentDay, waterPrice, electricityPrice, signingDate, remark);
    }

    @Override
    public String toString() {
        return "LeaseContractCreateDTO{" +
                "tenantId=" + tenantId +
                ", apartmentId=" + apartmentId +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", monthlyRent=" + monthlyRent +
                ", deposit=" + deposit +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", paymentDay=" + paymentDay +
                ", waterPrice=" + waterPrice +
                ", electricityPrice=" + electricityPrice +
                ", signingDate=" + signingDate +
                ", remark='" + remark + '\'' +
                '}';
    }
}
