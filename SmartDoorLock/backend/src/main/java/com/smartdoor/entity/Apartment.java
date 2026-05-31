package com.smartdoor.entity;

import com.baomidou.mybatisplus.annotation.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@TableName("apartment")
public class Apartment implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.AUTO)
    private Long id;

    private String apartmentNo;

    private String building;

    private String floor;

    private String roomNo;

    private BigDecimal area;

    private String roomType;

    private String decoration;

    private String furniture;

    private BigDecimal monthlyRent;

    private BigDecimal deposit;

    private String status;

    private String address;

    private String description;

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

    public String getApartmentNo() {
        return apartmentNo;
    }

    public void setApartmentNo(String apartmentNo) {
        this.apartmentNo = apartmentNo;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public BigDecimal getArea() {
        return area;
    }

    public void setArea(BigDecimal area) {
        this.area = area;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getDecoration() {
        return decoration;
    }

    public void setDecoration(String decoration) {
        this.decoration = decoration;
    }

    public String getFurniture() {
        return furniture;
    }

    public void setFurniture(String furniture) {
        this.furniture = furniture;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        Apartment apartment = (Apartment) o;
        return Objects.equals(id, apartment.id) &&
                Objects.equals(apartmentNo, apartment.apartmentNo) &&
                Objects.equals(building, apartment.building) &&
                Objects.equals(floor, apartment.floor) &&
                Objects.equals(roomNo, apartment.roomNo) &&
                Objects.equals(area, apartment.area) &&
                Objects.equals(roomType, apartment.roomType) &&
                Objects.equals(decoration, apartment.decoration) &&
                Objects.equals(furniture, apartment.furniture) &&
                Objects.equals(monthlyRent, apartment.monthlyRent) &&
                Objects.equals(deposit, apartment.deposit) &&
                Objects.equals(status, apartment.status) &&
                Objects.equals(address, apartment.address) &&
                Objects.equals(description, apartment.description) &&
                Objects.equals(createTime, apartment.createTime) &&
                Objects.equals(updateTime, apartment.updateTime) &&
                Objects.equals(deleted, apartment.deleted);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, apartmentNo, building, floor, roomNo, area, roomType, decoration, furniture, monthlyRent, deposit, status, address, description, createTime, updateTime, deleted);
    }

    @Override
    public String toString() {
        return "Apartment{" +
                "id=" + id +
                ", apartmentNo='" + apartmentNo + '\'' +
                ", building='" + building + '\'' +
                ", floor='" + floor + '\'' +
                ", roomNo='" + roomNo + '\'' +
                ", area=" + area +
                ", roomType='" + roomType + '\'' +
                ", decoration='" + decoration + '\'' +
                ", furniture='" + furniture + '\'' +
                ", monthlyRent=" + monthlyRent +
                ", deposit=" + deposit +
                ", status='" + status + '\'' +
                ", address='" + address + '\'' +
                ", description='" + description + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", deleted=" + deleted +
                '}';
    }
}
