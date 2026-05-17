package com.example.incomeexpenditure.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Category {
    private Long id;
    private String name;
    private Integer type;
    private String icon;
    private Integer sort;
    private LocalDateTime createTime;
}
