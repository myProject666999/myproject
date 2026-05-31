package com.port.container.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class ContainerOutDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "集装箱号不能为空")
    private String containerNo;

    private String truckNo;

    private String voyageOut;

    private String blNo;

    private LocalDateTime outTime;

    private String remark;

    private Long operatorId;

    private String operatorName;
}
