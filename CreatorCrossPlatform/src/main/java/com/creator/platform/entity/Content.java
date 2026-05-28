package com.creator.platform.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.creator.platform.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("content")
public class Content extends BaseEntity {

    private Long creatorId;

    private Long accountId;

    private Long platformId;

    private String platformContentId;

    private String contentTitle;

    private String contentType;

    private String contentCover;

    private String contentUrl;

    private LocalDateTime publishTime;

    private Integer publishHour;

    private Integer publishWeekday;

    private Integer duration;

    private String tags;

    private Integer status;
}
