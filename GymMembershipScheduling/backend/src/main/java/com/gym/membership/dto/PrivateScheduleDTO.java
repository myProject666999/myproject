package com.gym.membership.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PrivateScheduleDTO {
    @NotNull(message = "课程ID不能为空")
    private Long courseId;
    
    @NotNull(message = "排课日期不能为空")
    private LocalDate scheduleDate;
    
    @NotNull(message = "开始时间不能为空")
    private LocalTime startTime;
    
    @NotNull(message = "结束时间不能为空")
    private LocalTime endTime;
    
    private BigDecimal consumeHours;
}
