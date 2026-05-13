package com.gym.membership.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class GroupClassScheduleDTO {
    @NotNull(message = "课程类型ID不能为空")
    private Long courseTypeId;
    
    @NotNull(message = "教练ID不能为空")
    private Long coachId;
    
    @NotNull(message = "上课日期不能为空")
    private LocalDate classDate;
    
    @NotNull(message = "开始时间不能为空")
    private LocalTime startTime;
    
    @NotNull(message = "结束时间不能为空")
    private LocalTime endTime;
    
    private String classroom;
    
    private Integer maxParticipants;
}
