package com.survey.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("survey_question")
public class SurveyQuestion {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long surveyId;

    private String questionType;

    private String title;

    private String description;

    private Integer required;

    private Integer sortOrder;

    private String config;

    private String logicConfig;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
