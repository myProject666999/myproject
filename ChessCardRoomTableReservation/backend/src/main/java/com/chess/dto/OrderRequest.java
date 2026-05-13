package com.chess.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRequest {
    private Long tableId;
    private Long memberId;
    private LocalDateTime startTime;
    private String remark;
    private List<OrderItemDTO> items;
    private String paymentMethod;
}
