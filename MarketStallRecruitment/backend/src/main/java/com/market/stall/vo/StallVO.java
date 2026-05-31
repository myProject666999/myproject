package com.market.stall.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StallVO {

    private Long id;

    private Long eventId;

    private String stallCode;

    private String stallName;

    private String zone;

    private Integer rowNum;

    private Integer colNum;

    private Integer stallType;

    private BigDecimal areaSize;

    private BigDecimal price;

    private Integer status;

    private String facilities;

    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    private String occupierName;
}
