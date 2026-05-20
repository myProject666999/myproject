package com.restaurant.evaluation.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;

@Data
public class RestaurantDTO {

    @NotBlank(message = "餐厅名称不能为空")
    private String name;

    private String cuisineType;

    private String address;

    private String phone;

    private BigDecimal pricePerPerson;

    private String description;

}
