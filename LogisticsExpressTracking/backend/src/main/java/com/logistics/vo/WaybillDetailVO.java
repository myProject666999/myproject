package com.logistics.vo;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WaybillDetailVO implements Serializable {
    private Long id;
    private String waybillNo;
    private String senderName;
    private String senderPhone;
    private String senderAddress;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String goodsName;
    private BigDecimal goodsWeight;
    private BigDecimal freight;
    private Integer status;
    private String statusText;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private List<TrackingNodeVO> trackingNodes;
}
