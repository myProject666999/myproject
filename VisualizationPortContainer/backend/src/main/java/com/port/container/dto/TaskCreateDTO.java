package com.port.container.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class TaskCreateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "任务类型不能为空")
    private String taskType;

    private Integer priority;

    @NotNull(message = "集装箱ID不能为空")
    private Long containerId;

    private String containerNo;

    private Long sourceSlotId;

    private String sourcePosition;

    private Long targetSlotId;

    private String targetPosition;

    private String remark;

    private Long operatorId;

    private String operatorName;
}
