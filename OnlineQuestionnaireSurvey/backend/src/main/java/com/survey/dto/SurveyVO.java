package com.survey.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SurveyVO {
    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private Long userId;

    private String userNickname;

    private Integer status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer isAnonymous;

    private Integer maxResponses;

    private Integer responseCount;

    private Integer viewCount;

    private Integer questionCount;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
