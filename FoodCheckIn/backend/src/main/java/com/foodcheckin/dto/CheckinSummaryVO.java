package com.foodcheckin.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CheckinSummaryVO {
    private Long id;
    private LocalDate checkinDate;
    private String mealType;
    private BigDecimal overallRating;
    private String comment;
    private String photoUrl;
}
