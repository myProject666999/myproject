package com.survey.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("survey")
public class Survey {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private Long userId;

    private Integer status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer isAnonymous;

    private Integer maxResponses;

    private Integer responseCount;

    private Integer viewCount;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
