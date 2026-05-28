package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "meal_evaluation")
public class MealEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "accompany_meal_id", nullable = false)
    private Long accompanyMealId;

    @Column(name = "taste_score", nullable = false)
    private Integer tasteScore;

    @Column(name = "hygiene_score", nullable = false)
    private Integer hygieneScore;

    @Column(name = "service_score", nullable = false)
    private Integer serviceScore;

    @Column(name = "overall_score", nullable = false, precision = 3, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "taste_comment", columnDefinition = "TEXT")
    private String tasteComment;

    @Column(name = "hygiene_comment", columnDefinition = "TEXT")
    private String hygieneComment;

    @Column(name = "service_comment", columnDefinition = "TEXT")
    private String serviceComment;

    @Column(columnDefinition = "TEXT")
    private String suggestion;

    @Column(columnDefinition = "TEXT")
    private String images;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;
}
