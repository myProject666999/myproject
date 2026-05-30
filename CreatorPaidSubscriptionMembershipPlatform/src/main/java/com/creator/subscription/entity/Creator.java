package com.creator.subscription.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "creator")
public class Creator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "creator_name", nullable = false, length = 100)
    private String creatorName;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "total_subscribers", columnDefinition = "INT")
    private Integer totalSubscribers = 0;

    @Column(name = "total_earnings", columnDefinition = "BIGINT")
    private Long totalEarnings = 0L;

    @Column(name = "pending_earnings", columnDefinition = "BIGINT")
    private Long pendingEarnings = 0L;

    @Column(name = "available_earnings", columnDefinition = "BIGINT")
    private Long availableEarnings = 0L;

    @Column(name = "is_verified", columnDefinition = "TINYINT")
    private Integer isVerified = 0;

    @Column(columnDefinition = "TINYINT")
    private Integer status = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
