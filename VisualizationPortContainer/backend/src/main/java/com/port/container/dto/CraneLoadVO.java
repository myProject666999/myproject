package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class CraneLoadVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long craneId;

    private String craneCode;

    private String craneName;

    private Integer status;

    private Integer currentLoad;

    private Integer maxLoad;

    private BigDecimal loadRate;

    private Integer todayOperations;

    private String currentTask;

    private String currentPosition;
}
