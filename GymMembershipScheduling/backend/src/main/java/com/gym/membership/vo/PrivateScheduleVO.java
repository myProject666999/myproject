package com.gym.membership.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PrivateScheduleVO {
    private Long id;
    private Long courseId;
    private Long userId;
    private String userName;
    private Long coachId;
    private String coachName;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer status;
    private String statusName;
    private BigDecimal consumeHours;
}
