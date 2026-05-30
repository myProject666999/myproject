package com.creator.subscription.entity;

import com.creator.subscription.enums.WithdrawalStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "withdrawal_record")
public class WithdrawalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "withdrawal_no", nullable = false, unique = true, length = 64)
    private String withdrawalNo;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(nullable = false)
    private Long amount;

    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long fee = 0L;

    @Column(name = "actual_amount", nullable = false)
    private Long actualAmount;

    @Column(name = "withdrawal_method", nullable = false, length = 20)
    private String withdrawalMethod;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "account_info", nullable = false, columnDefinition = "JSON")
    private Map<String, String> accountInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "VARCHAR(20)")
    private WithdrawalStatus status = WithdrawalStatus.PENDING;

    @Column(length = 500)
    private String remark;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
