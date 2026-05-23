package com.survey.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class SurveyPublishDTO {
    @NotNull(message = "问卷ID不能为空")
    private Long surveyId;

    private Integer status = 1;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer maxResponses;
}
