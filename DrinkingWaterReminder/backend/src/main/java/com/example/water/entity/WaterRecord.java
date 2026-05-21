package com.example.water.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "water_record", indexes = {
    @Index(name = "idx_date", columnList = "record_date")
})
public class WaterRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer amount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @JsonFormat(pattern = "HH:mm:ss")
    @Column(name = "record_time", nullable = false)
    private LocalTime recordTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (recordDate == null) {
            recordDate = LocalDate.now();
        }
        if (recordTime == null) {
            recordTime = LocalTime.now();
        }
    }
}
