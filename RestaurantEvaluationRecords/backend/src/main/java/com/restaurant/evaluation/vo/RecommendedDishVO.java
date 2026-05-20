package com.restaurant.evaluation.vo;

import lombok.Data;

@Data
public class RecommendedDishVO {

    private Long id;

    private Long restaurantId;

    private Long userId;

    private String userName;

    private String dishName;

    private String description;

    private Integer recommendCount;

}
