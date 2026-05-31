package com.insurance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String claimNumber;

    @Column(nullable = false)
    private LocalDate incidentDate;

    @Column(nullable = false, length = 1000)
    private String incidentDescription;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal claimAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal approvedAmount;

    @Column(nullable = false)
    private String status;

    @Column(length = 500)
    private String remarks;

    private LocalDate claimDate;
    private LocalDate settlementDate;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private InsurancePolicy policy;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (claimDate == null) {
            claimDate = LocalDate.now();
        }
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }
}
