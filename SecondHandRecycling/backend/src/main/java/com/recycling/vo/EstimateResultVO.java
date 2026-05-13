package com.recycling.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EstimateResultVO {
    private Long categoryId;
    private String categoryName;
    private BigDecimal basePrice;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal estimatedPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String description;
}
