package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "menu")
public class Menu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "menu_date", nullable = false)
    private LocalDate menuDate;

    @Column(name = "meal_type", nullable = false, length = 20)
    private String mealType;

    @Column(name = "dish_name", nullable = false, length = 100)
    private String dishName;

    @Column(name = "dish_type", length = 50)
    private String dishType;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "create_by")
    private Long createBy;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
