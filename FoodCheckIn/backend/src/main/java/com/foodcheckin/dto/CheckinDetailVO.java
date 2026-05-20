package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CheckinDetailVO {
    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private LocalDate checkinDate;
    private String mealType;
    private BigDecimal totalAmount;
    private BigDecimal overallRating;
    private String comment;
    private LocalDateTime createdAt;
    private List<DishItem> dishes;
    private List<PhotoItem> photos;

    @Data
    public static class DishItem {
        private Long dishId;
        private String dishName;
        private BigDecimal rating;
        private String comment;
    }

    @Data
    public static class PhotoItem {
        private Long id;
        private Long dishId;
        private String photoUrl;
        private String description;
    }
}
