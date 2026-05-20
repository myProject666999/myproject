package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CheckinRequest {
    private Long restaurantId;
    private LocalDate checkinDate;
    private String mealType;
    private BigDecimal totalAmount;
    private BigDecimal overallRating;
    private String comment;
    private List<CheckinDishItem> dishes;
    private List<PhotoItem> photos;

    @Data
    public static class CheckinDishItem {
        private Long dishId;
        private BigDecimal rating;
        private String comment;
    }

    @Data
    public static class PhotoItem {
        private Long dishId;
        private String photoUrl;
        private String description;
    }
}
