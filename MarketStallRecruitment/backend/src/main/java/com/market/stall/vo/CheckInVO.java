package com.market.stall.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckInVO {

    private Long id;

    private Long eventId;

    private Long registrationId;

    private Long userId;

    private Long stallId;

    private LocalDateTime checkInTime;

    private Integer checkInType;

    private String checkInCode;

    private String deviceInfo;

    private String location;

    private Long verifiedBy;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String username;

    private String realName;

    private String stallCode;

    private String businessName;
}
