package com.micro.frontend.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class HealthCheckResultDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long appId;

    private String appCode;

    private Integer checkResult;

    private Integer responseTime;

    private String errorMessage;

    private LocalDateTime checkTime;

    private String checkUrl;

    private Integer healthStatus;
}
