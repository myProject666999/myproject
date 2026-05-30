package com.creator.subscription.entity;

import com.creator.subscription.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "subscription")
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "tier_id", nullable = false)
    private Long tierId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private SubscriptionStatus status = SubscriptionStatus.PENDING;

    @Column(name = "auto_renew", columnDefinition = "TINYINT")
    private Integer autoRenew = 1;

    @Column(name = "current_period_start", nullable = false)
    private LocalDateTime currentPeriodStart;

    @Column(name = "current_period_end", nullable = false)
    private LocalDateTime currentPeriodEnd;

    @Column(name = "cancel_at_period_end", columnDefinition = "TINYINT")
    private Integer cancelAtPeriodEnd = 0;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "last_payment_amount")
    private Long lastPaymentAmount;

    @Column(name = "last_payment_at")
    private LocalDateTime lastPaymentAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
