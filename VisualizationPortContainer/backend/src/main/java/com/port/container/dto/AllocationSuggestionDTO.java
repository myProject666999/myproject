package com.port.container.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class AllocationSuggestionDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "集装箱ID不能为空")
    private Long containerId;

    private String containerNo;

    private String containerType;

    private BigDecimal weight;

    private Long yardId;

    private String strategy;

    private Integer topN;
}
