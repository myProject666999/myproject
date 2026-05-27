package com.notification.common;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {
    private List<T> list;
    private Long total;
    private Long pageNum;
    private Long pageSize;
    private Long pages;

    public PageResult() {
    }

    public PageResult(List<T> list, Long total, Long pageNum, Long pageSize) {
        this.list = list;
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.pages = (total + pageSize - 1) / pageSize;
    }
}
