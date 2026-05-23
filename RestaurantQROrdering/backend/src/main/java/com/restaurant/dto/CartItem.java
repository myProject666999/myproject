package com.restaurant.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItem {
    private Long dishId;
    private String dishName;
    private BigDecimal price;
    private Integer quantity;
    private String image;
    
    public BigDecimal getSubtotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}
