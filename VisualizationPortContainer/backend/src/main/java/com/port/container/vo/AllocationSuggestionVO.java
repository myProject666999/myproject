package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class AllocationSuggestionVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long slotId;

    private String slotCode;

    private Long yardId;

    private String yardCode;

    private Integer rowNum;

    private Integer bayNum;

    private Integer tierNum;

    private BigDecimal maxWeight;

    private String containerType;

    private Integer score;

    private String strategy;

    private String reason;
}
