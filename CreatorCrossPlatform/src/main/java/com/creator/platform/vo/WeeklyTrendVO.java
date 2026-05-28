package com.creator.platform.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyTrendVO {

    private LocalDate date;
    private Long newFans;
    private Long views;
    private Long interactions;
}
