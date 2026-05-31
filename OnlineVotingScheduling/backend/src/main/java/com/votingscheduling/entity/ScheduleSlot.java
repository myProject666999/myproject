package com.votingscheduling.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "schedule_slot", indexes = {
        @Index(name = "idx_schedule", columnList = "schedule_id"),
        @Index(name = "idx_user", columnList = "user_id"),
        @Index(name = "idx_date", columnList = "date")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = {"schedule_id", "date", "start_time", "end_time", "user_id"})
})
public class ScheduleSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "week_day", nullable = false)
    private Integer weekDay;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_auto_assigned", nullable = false)
    private Boolean isAutoAssigned = false;

    @Column(nullable = false, length = 20)
    private String status = "ASSIGNED";

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
