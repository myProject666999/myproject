package com.travel.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "budget")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trip_id")
    private Long tripId;

    private String category;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "estimated_amount")
    private BigDecimal estimatedAmount;

    @Column(name = "actual_amount")
    private BigDecimal actualAmount;

    @Column(columnDefinition = "TEXT")
    private String remark;

    @Column(name = "created_time")
    private LocalDateTime createdTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
    }
}
