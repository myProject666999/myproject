package com.training.entity;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "certificate", indexes = {
        @Index(name = "idx_certificate_no", columnList = "certificate_no"),
        @Index(name = "idx_verify_code", columnList = "verify_code")
})
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "certificate_no", nullable = false, unique = true, length = 50)
    private String certificateNo;

    @Column(name = "training_id", nullable = false)
    private Long trainingId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_name", nullable = false, length = 50)
    private String studentName;

    @Column(name = "training_name", nullable = false, length = 200)
    private String trainingName;

    @Column(name = "instructor", length = 100)
    private String instructor;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "total_hours", precision = 5, scale = 1)
    private BigDecimal totalHours;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "certificate_url", length = 500)
    private String certificateUrl;

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "verify_code", nullable = false, unique = true, length = 100)
    private String verifyCode;

    @Column(name = "is_valid")
    private Integer isValid;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "revoked_reason", length = 500)
    private String revokedReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
