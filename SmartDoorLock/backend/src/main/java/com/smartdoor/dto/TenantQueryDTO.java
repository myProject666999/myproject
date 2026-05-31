package com.smartdoor.dto;

import com.smartdoor.common.PageQuery;
import java.io.Serializable;
import java.util.Objects;

public class TenantQueryDTO extends PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private String tenantNo;
    private String name;
    private String phone;
    private String idCard;
    private String status;
    private String keyword;

    public String getTenantNo() {
        return tenantNo;
    }

    public void setTenantNo(String tenantNo) {
        this.tenantNo = tenantNo;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getIdCard() {
        return idCard;
    }

    public void setIdCard(String idCard) {
        this.idCard = idCard;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
        TenantQueryDTO that = (TenantQueryDTO) o;
        return Objects.equals(tenantNo, that.tenantNo) &&
                Objects.equals(name, that.name) &&
                Objects.equals(phone, that.phone) &&
                Objects.equals(idCard, that.idCard) &&
                Objects.equals(status, that.status) &&
                Objects.equals(keyword, that.keyword);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), tenantNo, name, phone, idCard, status, keyword);
    }

    @Override
    public String toString() {
        return "TenantQueryDTO{" +
                "tenantNo='" + tenantNo + '\'' +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", idCard='" + idCard + '\'' +
                ", status='" + status + '\'' +
                ", keyword='" + keyword + '\'' +
                '}';
    }
}
