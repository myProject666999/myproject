package com.market.stall.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventVO {

    private Long id;

    private String title;

    private String description;

    private String coverImage;

    private String address;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationStart;

    private LocalDateTime registrationEnd;

    private Integer status;

    private String mapConfig;

    private String contactPhone;

    private String organizer;

    private Long createBy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private Integer currentRegistrationCount;

    private Integer totalStallCount;

    private Integer availableStallCount;
}
