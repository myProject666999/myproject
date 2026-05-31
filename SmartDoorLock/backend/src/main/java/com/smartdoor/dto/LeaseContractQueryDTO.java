package com.smartdoor.dto;

import com.smartdoor.common.PageQuery;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class LeaseContractQueryDTO extends PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private String contractNo;
    private Long tenantId;
    private String tenantName;
    private Long apartmentId;
    private String apartmentNo;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String keyword;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        LeaseContractQueryDTO that = (LeaseContractQueryDTO) o;
        return Objects.equals(contractNo, that.contractNo) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(status, that.status) &&
                Objects.equals(startDate, that.startDate) &&
                Objects.equals(endDate, that.endDate) &&
                Objects.equals(keyword, that.keyword);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), contractNo, tenantId, tenantName, apartmentId, apartmentNo, status, startDate, endDate, keyword);
    }

    @Override
    public String toString() {
        return "LeaseContractQueryDTO{" +
                "contractNo='" + contractNo + '\'' +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", status='" + status + '\'' +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", keyword='" + keyword + '\'' +
                '}';
    }
}
