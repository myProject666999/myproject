package com.survey.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuestionVO {
    private Long id;

    private Long surveyId;

    private String questionType;

    private String title;

    private String description;

    private Integer required;

    private Integer sortOrder;

    private Object config;

    private Object logicConfig;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
