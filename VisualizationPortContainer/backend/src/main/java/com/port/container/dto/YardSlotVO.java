package com.port.container.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class YardSlotVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String slotCode;

    private Long yardId;

    private String yardName;

    private Integer rowNo;

    private Integer bayNo;

    private Integer tierNo;

    private Integer status;

    private Long containerId;

    private String containerNo;

    private String sizeType;

    private Integer isDangerous;

    private Integer isRefrigerated;

    private Integer weightLevel;

    private String areaCode;
}
