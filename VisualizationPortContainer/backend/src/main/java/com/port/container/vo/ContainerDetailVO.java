package com.port.container.vo;

import com.port.container.entity.Container;
import com.port.container.entity.OperationLog;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class ContainerDetailVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Container container;

    private String yardName;

    private String slotCode;

    private List<OperationLog> history;
}
