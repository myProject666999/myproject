package com.habit.tracking.vo;

import lombok.Data;

@Data
public class RankingVO {
    private Long habitId;
    private String habitName;
    private String icon;
    private String color;
    private Integer streakDays;
    private Integer totalCheckins;
}
