package com.travel.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "attraction")
public class Attraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "daily_schedule_id")
    private Long dailyScheduleId;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;

    private BigDecimal longitude;

    private BigDecimal latitude;

    @Column(name = "visit_time")
    private LocalTime visitTime;

    private Integer duration;

    private BigDecimal cost;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "created_time")
    private LocalDateTime createdTime;

    @PrePersist
    protected void onCreate() {
        createdTime = LocalDateTime.now();
    }
}
