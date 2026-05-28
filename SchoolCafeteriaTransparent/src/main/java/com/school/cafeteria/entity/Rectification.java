package com.school.cafeteria.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "rectification")
public class Rectification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "inspection_id", nullable = false)
    private Long inspectionId;

    @Column(name = "rectify_person", nullable = false, length = 50)
    private String rectifyPerson;

    @Column(name = "rectify_measure", nullable = false, columnDefinition = "TEXT")
    private String rectifyMeasure;

    @Column(name = "rectify_start_date")
    private LocalDate rectifyStartDate;

    @Column(name = "rectify_end_date")
    private LocalDate rectifyEndDate;

    @Column(name = "rectify_images", columnDefinition = "TEXT")
    private String rectifyImages;

    @Column(name = "rectify_description", columnDefinition = "TEXT")
    private String rectifyDescription;

    @Column(name = "verify_person", length = 50)
    private String verifyPerson;

    @Column(name = "verify_date")
    private LocalDate verifyDate;

    @Column(name = "verify_result", length = 20)
    private String verifyResult;

    @Column(name = "verify_comment", columnDefinition = "TEXT")
    private String verifyComment;

    @CreationTimestamp
    @Column(name = "create_time")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
