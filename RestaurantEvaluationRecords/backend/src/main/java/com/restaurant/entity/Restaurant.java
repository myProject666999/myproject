package com.restaurant.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "restaurant")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(name = "cuisine_type", length = 50)
    private String cuisineType;

    @Column(name = "price_range", length = 20)
    private String priceRange;

    @Column(name = "cover_image", length = 255)
    private String coverImage;

    @Column(name = "avg_taste_score", precision = 3, scale = 1)
    private BigDecimal avgTasteScore = BigDecimal.ZERO;

    @Column(name = "avg_env_score", precision = 3, scale = 1)
    private BigDecimal avgEnvScore = BigDecimal.ZERO;

    @Column(name = "avg_service_score", precision = 3, scale = 1)
    private BigDecimal avgServiceScore = BigDecimal.ZERO;

    @Column(name = "avg_overall_score", precision = 3, scale = 1)
    private BigDecimal avgOverallScore = BigDecimal.ZERO;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
