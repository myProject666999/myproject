package com.smartdoor.common;

import java.io.Serializable;
import java.util.Objects;

public class PageQuery implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderBy;
    private String orderDirection = "desc";

    public Integer getPageNum() {
        return pageNum;
    }

    public void setPageNum(Integer pageNum) {
        this.pageNum = pageNum;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    public String getOrderDirection() {
        return orderDirection;
    }

    public void setOrderDirection(String orderDirection) {
        this.orderDirection = orderDirection;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PageQuery pageQuery = (PageQuery) o;
        return Objects.equals(pageNum, pageQuery.pageNum) &&
                Objects.equals(pageSize, pageQuery.pageSize) &&
                Objects.equals(orderBy, pageQuery.orderBy) &&
                Objects.equals(orderDirection, pageQuery.orderDirection);
    }

    @Override
    public int hashCode() {
        return Objects.hash(pageNum, pageSize, orderBy, orderDirection);
    }

    @Override
    public String toString() {
        return "PageQuery{" +
                "pageNum=" + pageNum +
                ", pageSize=" + pageSize +
                ", orderBy='" + orderBy + '\'' +
                ", orderDirection='" + orderDirection + '\'' +
                '}';
    }
}
