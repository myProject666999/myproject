package com.creator.subscription.entity;

import com.creator.subscription.enums.SettlementStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "earning_detail")
public class EarningDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "payment_record_id")
    private Long paymentRecordId;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "platform_fee", nullable = false)
    private Long platformFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "settlement_status", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private SettlementStatus settlementStatus = SettlementStatus.PENDING;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
