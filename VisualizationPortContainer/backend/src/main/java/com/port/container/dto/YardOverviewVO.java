package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

@Data
public class YardOverviewVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long yardId;

    private String yardCode;

    private String yardName;

    private Integer totalSlots;

    private Integer occupiedSlots;

    private Integer availableSlots;

    private BigDecimal utilizationRate;

    private Integer rows;

    private Integer bays;

    private Integer maxTiers;

    private Integer status;

    private List<YardSlotVO> slotList;
}
