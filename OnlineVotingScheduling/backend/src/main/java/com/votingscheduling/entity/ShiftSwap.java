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
@Table(name = "shift_swap", indexes = {
        @Index(name = "idx_slot", columnList = "slot_id"),
        @Index(name = "idx_original_user", columnList = "original_user_id"),
        @Index(name = "idx_swap_user", columnList = "swap_user_id"),
        @Index(name = "idx_status", columnList = "status")
})
public class ShiftSwap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_id", nullable = false)
    private Long slotId;

    @Column(name = "original_user_id", nullable = false)
    private Long originalUserId;

    @Column(name = "swap_user_id", nullable = false)
    private Long swapUserId;

    @Column(nullable = false, length = 500)
    private String reason;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "approve_time")
    private LocalDateTime approveTime;

    @Column(name = "approve_comment", length = 500)
    private String approveComment;

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
