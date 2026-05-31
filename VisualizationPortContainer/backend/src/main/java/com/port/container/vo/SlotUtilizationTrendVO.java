package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SlotUtilizationTrendVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private LocalDate statDate;

    private Long yardId;

    private String yardCode;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private BigDecimal utilizationRate;
}
