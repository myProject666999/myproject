package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class YardOverviewVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String yardCode;

    private String yardName;

    private BigDecimal area;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private Integer availableSlots;

    private BigDecimal occupancyRate;

    private Integer maxTiers;

    private Integer rows;

    private Integer bays;

    private Integer status;

    private Map<Integer, Integer> tierSlotCount;

    private Map<Integer, Integer> tierOccupiedCount;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
