
package com.beautyhair.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {
    private Long total;
    private List<T> records;
    private Long current;
    private Long size;
    private Long pages;

    public static <T> PageResult<T> of(Long total, List<T> records, Long current, Long size) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(total);
        result.setRecords(records);
        result.setCurrent(current);
        result.setSize(size);
        result.setPages(total > 0 && size > 0 ? (total + size - 1) / size : 0L);
        return result;
    }

    public static <T> PageResult<T> of(com.baomidou.mybatisplus.extension.plugins.pagination.Page<T> page) {
        return of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize());
    }

    public PageResult() {
    }

    public PageResult(List<T> records, Long total) {
        this.records = records;
        this.total = total;
    }
}
