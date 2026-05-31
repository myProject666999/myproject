package com.port.container.vo;

import lombok.Data;

import java.io.Serializable;

@Data
public class SlotHeatmapVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer rowNum;

    private Integer bayNum;

    private Integer tierNum;

    private Integer status;

    private Long containerId;

    private String containerNo;

    private Integer value;
}
