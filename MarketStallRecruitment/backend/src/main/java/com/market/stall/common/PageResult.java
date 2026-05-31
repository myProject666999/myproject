package com.market.stall.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.util.List;

@Data
public class PageResult<T> {

    private List<T> records;
    private Long total;
    private Long pageNum;
    private Long pageSize;

    public PageResult(IPage<T> page) {
        this.records = page.getRecords();
        this.total = page.getTotal();
        this.pageNum = page.getCurrent();
        this.pageSize = page.getSize();
    }
}
