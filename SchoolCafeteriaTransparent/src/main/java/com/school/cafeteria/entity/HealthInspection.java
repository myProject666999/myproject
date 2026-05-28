package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "health_inspection")
public class HealthInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_no", nullable = false, unique = true, length = 50)
    private String inspectionNo;

    @Column(name = "inspection_date", nullable = false)
    private LocalDate inspectionDate;

    @Column(name = "inspection_type", nullable = false, length = 50)
    private String inspectionType;

    @Column(nullable = false, length = 50)
    private String inspector;

    @Column(name = "check_items", nullable = false, columnDefinition = "TEXT")
    private String checkItems;

    @Column(name = "overall_result", nullable = false, length = 20)
    private String overallResult;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "issue_description", columnDefinition = "TEXT")
    private String issueDescription;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(name = "rectify_deadline")
    private LocalDate rectifyDeadline;

    @Column(name = "rectify_status", length = 20)
    private String rectifyStatus = "PENDING";

    @Transient
    private Rectification rectification;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
