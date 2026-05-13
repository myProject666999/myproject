package com.gym.membership.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {
    private Long total;
    private Long pages;
    private Long current;
    private Long size;
    private List<T> records;
}
