package com.survey.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class SurveyPublishDTO {
    @NotNull(message = "问卷ID不能为空")
    private Long surveyId;

    private Integer status = 1;
}
