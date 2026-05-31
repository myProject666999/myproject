package com.insurance.entity;

import javax.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "insurance_policies")
public class InsurancePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String policyNumber;

    @Column(nullable = false)
    private String insuranceType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal sumInsured;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal premium;

    @Column(nullable = false)
    private String paymentCycle;

    @Column(nullable = false)
    private LocalDate effectiveDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    private String insuranceCompany;

    @Column(length = 1000)
    private String remarks;

    @Column(nullable = false)
    private String status;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "insured_person_id")
    private InsuredPerson insuredPerson;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Beneficiary> beneficiaries = new ArrayList<>();

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentRecord> paymentRecords = new ArrayList<>();

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Claim> claims = new ArrayList<>();

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    private LocalDate createdAt;
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    public void addBeneficiary(Beneficiary beneficiary) {
        beneficiaries.add(beneficiary);
        beneficiary.setPolicy(this);
    }

    public void addPaymentRecord(PaymentRecord record) {
        paymentRecords.add(record);
        record.setPolicy(this);
    }

    public void addClaim(Claim claim) {
        claims.add(claim);
        claim.setPolicy(this);
    }

    public void addAttachment(Attachment attachment) {
        attachments.add(attachment);
        attachment.setPolicy(this);
    }
}
