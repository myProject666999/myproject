package com.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderVO {
    private Long id;
    private String orderNo;
    private Long tableId;
    private String tableNo;
    private BigDecimal totalAmount;
    private BigDecimal payAmount;
    private String payStatus;
    private String orderStatus;
    private String remark;
    private LocalDateTime payTime;
    private LocalDateTime finishTime;
    private LocalDateTime createTime;
    private List<OrderItemVO> items;
    
    @Data
    public static class OrderItemVO {
        private Long id;
        private Long dishId;
        private String dishName;
        private BigDecimal dishPrice;
        private Integer quantity;
        private BigDecimal subtotal;
        private String dishStatus;
        private String image;
    }
}
