package com.votingscheduling.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "schedule_history", indexes = {
        @Index(name = "idx_slot", columnList = "slot_id")
})
public class ScheduleHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "action_user_id", nullable = false)
    private Long actionUserId;

    @Column(name = "old_user_id")
    private Long oldUserId;

    @Column(name = "new_user_id")
    private Long newUserId;

    @Column(length = 500)
    private String detail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
