package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class CraneLoadInfoVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long craneId;

    private String craneCode;

    private String craneName;

    private Integer status;

    private String statusName;

    private BigDecimal currentLoad;

    private BigDecimal maxLoad;

    private BigDecimal loadRate;

    private Integer pendingTasks;

    private Integer completedTasksToday;

    private String operator;

    private String currentPosition;
}
