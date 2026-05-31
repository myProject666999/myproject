package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StallDTO {

    @NotNull
    private Long eventId;

    @NotBlank
    private String stallCode;

    private String stallName;

    private String zone;

    private Integer rowNum;

    private Integer colNum;

    private Integer stallType;

    private BigDecimal areaSize;

    @NotNull
    private BigDecimal price;

    private String facilities;

    private String remark;
}
