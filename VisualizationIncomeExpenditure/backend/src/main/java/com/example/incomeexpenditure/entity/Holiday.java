package com.example.incomeexpenditure.entity;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Holiday {
    private Long id;
    private LocalDate date;
    private String name;
    private Integer type;
    private LocalDateTime createTime;
}
