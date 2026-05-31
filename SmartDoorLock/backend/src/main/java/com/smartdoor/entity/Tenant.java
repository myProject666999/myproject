package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("tenant")
public class Tenant implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String tenantNo;

    private String name;

    private String phone;

    private String idCard;

    private String gender;

    private Integer age;

    private String workUnit;

    private String emergencyContact;

    private String emergencyPhone;

    private String address;

    private String status;

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

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getWorkUnit() {
        return workUnit;
    }

    public void setWorkUnit(String workUnit) {
        this.workUnit = workUnit;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }

    public String getEmergencyPhone() {
        return emergencyPhone;
    }

    public void setEmergencyPhone(String emergencyPhone) {
        this.emergencyPhone = emergencyPhone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
        Tenant tenant = (Tenant) o;
        return Objects.equals(id, tenant.id) &&
                Objects.equals(tenantNo, tenant.tenantNo) &&
                Objects.equals(name, tenant.name) &&
                Objects.equals(phone, tenant.phone) &&
                Objects.equals(idCard, tenant.idCard) &&
                Objects.equals(gender, tenant.gender) &&
                Objects.equals(age, tenant.age) &&
                Objects.equals(workUnit, tenant.workUnit) &&
                Objects.equals(emergencyContact, tenant.emergencyContact) &&
                Objects.equals(emergencyPhone, tenant.emergencyPhone) &&
                Objects.equals(address, tenant.address) &&
                Objects.equals(status, tenant.status) &&
                Objects.equals(remark, tenant.remark) &&
                Objects.equals(createTime, tenant.createTime) &&
                Objects.equals(updateTime, tenant.updateTime) &&
                Objects.equals(deleted, tenant.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, tenantNo, name, phone, idCard, gender, age, workUnit, emergencyContact, emergencyPhone, address, status, remark, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "Tenant{" +
                "id=" + id +
                ", tenantNo='" + tenantNo + '\'' +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", idCard='" + idCard + '\'' +
                ", gender='" + gender + '\'' +
                ", age=" + age +
                ", workUnit='" + workUnit + '\'' +
                ", emergencyContact='" + emergencyContact + '\'' +
                ", emergencyPhone='" + emergencyPhone + '\'' +
                ", address='" + address + '\'' +
                ", status='" + status + '\'' +
                ", remark='" + remark + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
