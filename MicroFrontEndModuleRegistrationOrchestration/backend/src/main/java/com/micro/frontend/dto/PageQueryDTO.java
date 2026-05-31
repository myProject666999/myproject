package com.micro.frontend.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class PageQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String keyword;

    private Integer status;

    public Integer getOffset() {
        return (pageNum - 1) * pageSize;
    }
}
