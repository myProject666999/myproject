package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ThroughputVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private LocalDate statDate;

    private Integer inCount;

    private Integer outCount;

    private Integer moveCount;

    private Integer totalCount;

    private BigDecimal totalWeight;

    private String type;
}
