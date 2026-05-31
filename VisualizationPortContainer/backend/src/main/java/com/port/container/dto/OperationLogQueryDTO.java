package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class OperationLogQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String module;

    private String operationType;

    private Long businessId;

    private String businessNo;

    private Long operatorId;

    private String operatorName;

    private Integer status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long current;

    private Long size;
}
