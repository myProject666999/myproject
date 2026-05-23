package com.survey.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class SurveyCreateDTO {
    @NotBlank(message = "问卷标题不能为空")
    private String title;

    private String description;

    private String coverImage;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer isAnonymous = 1;

    private Integer maxResponses = -1;
}
