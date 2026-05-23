package com.survey.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class QuestionDTO {
    private Long id;

    @NotBlank(message = "题目类型不能为空")
    private String questionType;

    @NotBlank(message = "题目标题不能为空")
    private String title;

    private String description;

    private Integer required = 1;

    private Integer sortOrder;

    private Object config;

    private Object logicConfig;
}
