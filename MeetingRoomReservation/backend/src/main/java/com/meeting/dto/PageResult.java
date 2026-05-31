package com.meeting.dto;

import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {

    private Long total;

    private List<T> records;

    private Integer pageNum;

    private Integer pageSize;

    public static <T> PageResult<T> of(Long total, List<T> records, Integer pageNum, Integer pageSize) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(total);
        result.setRecords(records);
        result.setPageNum(pageNum);
        result.setPageSize(pageSize);
        return result;
    }
}
