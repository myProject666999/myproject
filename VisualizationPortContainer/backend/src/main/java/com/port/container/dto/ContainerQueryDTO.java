package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class ContainerQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String containerNo;

    private String containerType;

    private String containerSize;

    private Integer status;

    private Long yardId;

    private Long slotId;

    private String goodsName;

    private LocalDateTime inTimeStart;

    private LocalDateTime inTimeEnd;

    private LocalDateTime outTimeStart;

    private LocalDateTime outTimeEnd;

    private Long current;

    private Long size;
}
