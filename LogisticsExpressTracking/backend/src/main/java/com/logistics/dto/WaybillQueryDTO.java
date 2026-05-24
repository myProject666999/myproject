package com.logistics.dto;

import lombok.Data;

@Data
public class WaybillQueryDTO {
    private String waybillNo;
    private String senderPhone;
    private String receiverPhone;
    private Integer status;
    private Integer pageNum = 1;
    private Integer pageSize = 10;
}
