package com.recruitment.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ApplicationStatusUpdateDTO {

    @NotNull(message = "投递记录ID不能为空")
    private Long applicationId;

    @NotBlank(message = "状态不能为空")
    private String status;

    private String remark;

    private LocalDateTime interviewTime;

    private String interviewVenue;
}
