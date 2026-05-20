package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DishVO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String description;
    private BigDecimal avgRating;
    private Integer ratingCount;
}
