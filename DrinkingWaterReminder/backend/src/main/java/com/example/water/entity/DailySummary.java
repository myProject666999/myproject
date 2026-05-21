package com.example.water.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "daily_summary", indexes = {
    @Index(name = "idx_date", columnList = "summary_date")
})
public class DailySummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "summary_date", nullable = false, unique = true)
    private LocalDate summaryDate;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount = 0;

    @Column(name = "target_amount", nullable = false)
    private Integer targetAmount = 2000;

    @Column(name = "is_achieved", nullable = false)
    private Boolean isAchieved = false;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
