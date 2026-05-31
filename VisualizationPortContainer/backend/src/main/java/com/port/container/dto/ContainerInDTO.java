package com.port.container.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ContainerInDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "集装箱号不能为空")
    private String containerNo;

    private String isoCode;

    private String sizeType;

    private String operator;

    private Long operatorId;

    private String operatorName;

    private BigDecimal grossWeight;

    private String cargoType;

    private Integer isDangerous;

    private Integer isRefrigerated;

    private BigDecimal temperature;

    private String dangerousClass;

    private String unCode;

    @NotBlank(message = "车牌号不能为空")
    private String truckNo;

    private String voyageIn;

    private String blNo;

    private String shipper;

    private String consignee;

    private LocalDateTime outTime;

    private String remark;
}
