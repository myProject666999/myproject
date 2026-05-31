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
@Table(name = "team_member", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"team_id", "user_id"})
})
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "is_leader", nullable = false)
    private Boolean isLeader = false;

    @Column(name = "join_at", nullable = false)
    private LocalDateTime joinAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        joinAt = LocalDateTime.now();
        createdAt = LocalDateTime.now();
    }
}
