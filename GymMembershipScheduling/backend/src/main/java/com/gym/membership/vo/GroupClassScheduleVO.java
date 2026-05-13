package com.gym.membership.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class GroupClassScheduleVO {
    private Long id;
    private Long courseTypeId;
    private String courseTypeName;
    private Long coachId;
    private String coachName;
    private LocalDate classDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String classroom;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private Integer status;
    private String statusName;
}
