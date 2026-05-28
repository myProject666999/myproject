package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "accompany_meal")
public class AccompanyMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType;

    @Column(name = "accompany_type", nullable = false, length = 20)
    private String accompanyType;

    @Column(name = "accompany_person", nullable = false, length = 50)
    private String accompanyPerson;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "class_name", length = 50)
    private String className;

    @Column(name = "arrival_time")
    private LocalDateTime arrivalTime;

    @Column(name = "departure_time")
    private LocalDateTime departureTime;

    @Column(name = "signature_image", length = 255)
    private String signatureImage;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Transient
    private MealEvaluation evaluation;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
