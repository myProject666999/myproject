package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class MonthReviewVO {
    private String month;
    private Integer totalCheckins;
    private Integer totalRestaurants;
    private BigDecimal totalAmount;
    private BigDecimal avgRating;
    private List<RestaurantStats> topRestaurants;
    private List<DishStats> topDishes;
    private Map<String, Integer> cuisineDistribution;
    private List<DailyCheckin> dailyCheckins;

    @Data
    public static class RestaurantStats {
        private Long restaurantId;
        private String restaurantName;
        private Integer checkinCount;
        private BigDecimal avgRating;
    }

    @Data
    public static class DishStats {
        private Long dishId;
        private String dishName;
        private String restaurantName;
        private BigDecimal avgRating;
    }

    @Data
    public static class DailyCheckin {
        private String date;
        private Integer count;
    }
}
