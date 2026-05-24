package com.logistics.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class WaybillCreateDTO {
    @NotBlank(message = "寄件人姓名不能为空")
    private String senderName;

    @NotBlank(message = "寄件人电话不能为空")
    private String senderPhone;

    @NotBlank(message = "寄件人地址不能为空")
    private String senderAddress;

    @NotBlank(message = "收件人姓名不能为空")
    private String receiverName;

    @NotBlank(message = "收件人电话不能为空")
    private String receiverPhone;

    @NotBlank(message = "收件人地址不能为空")
    private String receiverAddress;

    @NotBlank(message = "物品名称不能为空")
    private String goodsName;

    private BigDecimal goodsWeight;

    private BigDecimal freight;
}
