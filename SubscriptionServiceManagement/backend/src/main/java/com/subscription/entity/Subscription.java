package com.subscription.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 10)
    private String currency = "CNY";

    @Enumerated(EnumType.STRING)
    @Column(name = "cycle_type", nullable = false, length = 20)
    private CycleType cycleType;

    @Column(name = "cycle_days")
    private Integer cycleDays;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "next_renewal_date", nullable = false)
    private LocalDate nextRenewalDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "reminder_days")
    private Integer reminderDays = 7;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(length = 100)
    private String account;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

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
