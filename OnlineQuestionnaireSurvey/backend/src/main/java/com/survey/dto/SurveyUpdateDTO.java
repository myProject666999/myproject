package com.survey.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SurveyUpdateDTO {
    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer isAnonymous;

    private Integer maxResponses;
}
