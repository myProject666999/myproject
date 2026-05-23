package com.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private Long tableId;
    private String remark;
    private List<OrderItemRequest> items;
    
    @Data
    public static class OrderItemRequest {
        private Long dishId;
        private Integer quantity;
    }
}
