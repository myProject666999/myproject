package com.restaurant.evaluation.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ReviewVO {

    private Long id;

    private Long restaurantId;

    private String restaurantName;

    private Long userId;

    private String userName;

    private String userAvatar;

    private Integer tasteScore;

    private Integer environmentScore;

    private Integer serviceScore;

    private BigDecimal overallScore;

    private Integer repurchaseIntention;

    private String repurchaseIntentionText;

    private String content;

    private LocalDate visitDate;

    private LocalDateTime createTime;

}
