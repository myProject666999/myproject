package com.port.container.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class TaskAssignDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    @NotNull(message = "吊机ID不能为空")
    private Long craneId;

    private String craneCode;

    private Long operatorId;

    private String operatorName;
}
