package com.smartdoor.dto;

import com.smartdoor.common.PageQuery;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class RentBillQueryDTO extends PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private String billNo;
    private Long contractId;
    private String contractNo;
    private Long tenantId;
    private String tenantName;
    private Long apartmentId;
    private String apartmentNo;
    private String billMonth;
    private String status;
    private LocalDate dueDateStart;
    private LocalDate dueDateEnd;
    private String keyword;

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDueDateStart() {
        return dueDateStart;
    }

    public void setDueDateStart(LocalDate dueDateStart) {
        this.dueDateStart = dueDateStart;
    }

    public LocalDate getDueDateEnd() {
        return dueDateEnd;
    }

    public void setDueDateEnd(LocalDate dueDateEnd) {
        this.dueDateEnd = dueDateEnd;
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
        RentBillQueryDTO that = (RentBillQueryDTO) o;
        return Objects.equals(billNo, that.billNo) &&
                Objects.equals(contractId, that.contractId) &&
                Objects.equals(contractNo, that.contractNo) &&
                Objects.equals(tenantId, that.tenantId) &&
                Objects.equals(tenantName, that.tenantName) &&
                Objects.equals(apartmentId, that.apartmentId) &&
                Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(billMonth, that.billMonth) &&
                Objects.equals(status, that.status) &&
                Objects.equals(dueDateStart, that.dueDateStart) &&
                Objects.equals(dueDateEnd, that.dueDateEnd) &&
                Objects.equals(keyword, that.keyword);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), billNo, contractId, contractNo, tenantId, tenantName, apartmentId, apartmentNo, billMonth, status, dueDateStart, dueDateEnd, keyword);
    }

    @Override
    public String toString() {
        return "RentBillQueryDTO{" +
                "billNo='" + billNo + '\'' +
                ", contractId=" + contractId +
                ", contractNo='" + contractNo + '\'' +
                ", tenantId=" + tenantId +
                ", tenantName='" + tenantName + '\'' +
                ", apartmentId=" + apartmentId +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", billMonth='" + billMonth + '\'' +
                ", status='" + status + '\'' +
                ", dueDateStart=" + dueDateStart +
                ", dueDateEnd=" + dueDateEnd +
                ", keyword='" + keyword + '\'' +
                '}';
    }
}
