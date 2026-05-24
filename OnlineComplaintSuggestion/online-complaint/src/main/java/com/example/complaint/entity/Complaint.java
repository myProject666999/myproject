package com.example.complaint.entity;

import com.example.complaint.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "complaint")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Transient
    private String categoryName;

    @Column(length = 100)
    private String area;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "contact_name", length = 50)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ComplaintStatus status = ComplaintStatus.PENDING;

    private Integer rating;

    @Column(length = 1000)
    private String feedback;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    public void prePersist() {
        if (createTime == null) {
            createTime = LocalDateTime.now();
        }
        if (updateTime == null) {
            updateTime = LocalDateTime.now();
        }
        if (status == null) {
            status = ComplaintStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updateTime = LocalDateTime.now();
    }
}
