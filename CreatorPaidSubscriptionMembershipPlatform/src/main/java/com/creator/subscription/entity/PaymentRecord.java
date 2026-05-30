package com.creator.subscription.entity;

import com.creator.subscription.enums.PaymentMethod;
import com.creator.subscription.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_record")
public class PaymentRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 64)
    private String orderNo;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "subscription_id")
    private Long subscriptionId;

    @Column(name = "tier_id", nullable = false)
    private Long tierId;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "platform_fee", nullable = false)
    private Long platformFee;

    @Column(name = "creator_earning", nullable = false)
    private Long creatorEarning;

    @Column(name = "fee_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal feeRate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20, columnDefinition = "VARCHAR(20)")
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
