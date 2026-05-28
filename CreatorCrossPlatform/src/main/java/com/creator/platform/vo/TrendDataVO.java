package com.creator.platform.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendDataVO {

    private LocalDate date;
    private Long value;
    private String platformCode;
}
