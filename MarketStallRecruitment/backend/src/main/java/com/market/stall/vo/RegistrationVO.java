package com.market.stall.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RegistrationVO {

    private Long id;

    private Long eventId;

    private Long userId;

    private Long stallId;

    private String businessName;

    private Integer businessType;

    private String businessDesc;

    private String businessImages;

    private String idCardNumber;

    private String contactPhone;

    private Integer auditStatus;

    private String auditRemark;

    private Long auditBy;

    private LocalDateTime auditTime;

    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String username;

    private String stallCode;

    private String eventName;
}
