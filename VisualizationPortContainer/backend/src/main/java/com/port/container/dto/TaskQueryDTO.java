package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class TaskQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String taskNo;

    private String taskType;

    private Integer status;

    private Integer priority;

    private Long craneId;

    private String containerNo;

    private LocalDateTime plannedStartTimeStart;

    private LocalDateTime plannedStartTimeEnd;

    private Integer pageNum = 1;

    private Integer pageSize = 10;
}
