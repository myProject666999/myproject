package com.market.stall.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnnouncementVO {

    private Long id;

    private Long eventId;

    private String title;

    private String content;

    private Integer type;

    private Integer isTop;

    private LocalDateTime publishTime;

    private Integer status;

    private Long createBy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String createByName;
}
