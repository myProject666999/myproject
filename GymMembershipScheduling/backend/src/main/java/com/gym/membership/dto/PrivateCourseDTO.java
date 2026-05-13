package com.gym.membership.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PrivateCourseDTO {
    @NotNull(message = "会员ID不能为空")
    private Long userId;
    
    @NotNull(message = "教练ID不能为空")
    private Long coachId;
    
    @NotNull(message = "总课时不能为空")
    private Integer totalHours;
    
    @NotNull(message = "价格不能为空")
    private BigDecimal price;
}
