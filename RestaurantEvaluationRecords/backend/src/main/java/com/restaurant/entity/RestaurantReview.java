package com.restaurant.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "restaurant_review", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "restaurant_id"})
})
public class RestaurantReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "restaurant_id", nullable = false)
    private Long restaurantId;

    @Column(name = "taste_score", nullable = false)
    private Integer tasteScore;

    @Column(name = "env_score", nullable = false)
    private Integer envScore;

    @Column(name = "service_score", nullable = false)
    private Integer serviceScore;

    @Column(name = "overall_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal overallScore;

    @Column(name = "repurchase_willingness", nullable = false)
    private Integer repurchaseWillingness = 0;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Transient
    private String nickname;

    @Transient
    private String avatar;

    @CreationTimestamp
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
