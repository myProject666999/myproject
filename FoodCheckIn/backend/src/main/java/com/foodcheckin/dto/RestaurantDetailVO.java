package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RestaurantDetailVO {
    private Long id;
    private String name;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String phone;
    private String cuisineType;
    private BigDecimal avgPrice;
    private String description;
    private BigDecimal overallRating;
    private Integer checkinCount;
    private List<DishVO> dishes;
    private List<CheckinSummaryVO> recentCheckins;
}
