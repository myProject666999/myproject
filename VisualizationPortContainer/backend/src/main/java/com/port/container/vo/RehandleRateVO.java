package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RehandleRateVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private LocalDate statDate;

    private Integer totalOperations;

    private Integer rehandleCount;

    private BigDecimal rehandleRate;

    private Long yardId;

    private String yardCode;
}
