package com.habit.tracking.vo;

import lombok.Data;

@Data
public class HabitCheckinVO {
    private Long id;
    private String name;
    private String icon;
    private String color;
    private String description;
    private Integer targetDays;
    private Integer currentStreak;
    private Integer totalCheckins;
    private boolean todayChecked;
}
