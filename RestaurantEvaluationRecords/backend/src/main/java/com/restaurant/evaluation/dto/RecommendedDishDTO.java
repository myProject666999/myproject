package com.restaurant.evaluation.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class RecommendedDishDTO {

    @NotNull(message = "餐厅ID不能为空")
    private Long restaurantId;

    @NotBlank(message = "菜品名称不能为空")
    private String dishName;

    private String description;

}
