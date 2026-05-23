package com.survey.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("survey_response")
public class SurveyResponse {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long surveyId;

    private Long userId;

    private String ipAddress;

    private String userAgent;

    private String deviceId;

    private LocalDateTime submitTime;

    private Integer duration;

    private Integer status;

    private LocalDateTime createTime;
}
