package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CraneUtilizationVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private LocalDate statDate;

    private Long craneId;

    private String craneCode;

    private String craneName;

    private Integer totalOperationTime;

    private Integer availableTime;

    private BigDecimal utilizationRate;

    private Integer operationCount;

    private Integer completedTasks;
}
