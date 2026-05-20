package com.restaurant.evaluation.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RestaurantVO {

    private Long id;

    private String name;

    private String cuisineType;

    private String address;

    private String phone;

    private BigDecimal pricePerPerson;

    private String description;

    private Long createUserId;

    private String createUserName;

    private LocalDateTime createTime;

    private BigDecimal avgTasteScore;

    private BigDecimal avgEnvironmentScore;

    private BigDecimal avgServiceScore;

    private BigDecimal avgOverallScore;

    private Integer reviewCount;

    private BigDecimal repurchaseRate;

    private List<RecommendedDishVO> recommendedDishes;

    private List<ReviewVO> reviews;

}
