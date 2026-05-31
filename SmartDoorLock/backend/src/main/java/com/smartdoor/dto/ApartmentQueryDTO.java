package com.smartdoor.dto;

import com.smartdoor.common.PageQuery;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

public class ApartmentQueryDTO extends PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private String apartmentNo;
    private String building;
    private String floor;
    private String roomType;
    private String status;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private String keyword;

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

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getMinRent() {
        return minRent;
    }

    public void setMinRent(BigDecimal minRent) {
        this.minRent = minRent;
    }

    public BigDecimal getMaxRent() {
        return maxRent;
    }

    public void setMaxRent(BigDecimal maxRent) {
        this.maxRent = maxRent;
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
        ApartmentQueryDTO that = (ApartmentQueryDTO) o;
        return Objects.equals(apartmentNo, that.apartmentNo) &&
                Objects.equals(building, that.building) &&
                Objects.equals(floor, that.floor) &&
                Objects.equals(roomType, that.roomType) &&
                Objects.equals(status, that.status) &&
                Objects.equals(minRent, that.minRent) &&
                Objects.equals(maxRent, that.maxRent) &&
                Objects.equals(keyword, that.keyword);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), apartmentNo, building, floor, roomType, status, minRent, maxRent, keyword);
    }

    @Override
    public String toString() {
        return "ApartmentQueryDTO{" +
                "apartmentNo='" + apartmentNo + '\'' +
                ", building='" + building + '\'' +
                ", floor='" + floor + '\'' +
                ", roomType='" + roomType + '\'' +
                ", status='" + status + '\'' +
                ", minRent=" + minRent +
                ", maxRent=" + maxRent +
                ", keyword='" + keyword + '\'' +
                '}';
    }
}
