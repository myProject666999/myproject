package com.survey.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("survey_answer")
public class SurveyAnswer {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long responseId;

    private Long surveyId;

    private Long questionId;

    private String questionType;

    private String answerContent;

    private String answerText;

    private LocalDateTime createTime;
}
