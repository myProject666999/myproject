package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class SlotQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long yardId;

    private Integer rowNum;

    private Integer bayNum;

    private Integer tierNum;

    private String containerType;

    private BigDecimal minWeight;

    private BigDecimal maxWeight;

    private Integer status;

    private Long current;

    private Long size;
}
