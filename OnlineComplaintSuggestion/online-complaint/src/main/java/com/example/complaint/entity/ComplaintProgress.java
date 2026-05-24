package com.example.complaint.entity;

import com.example.complaint.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "complaint_progress")
public class ComplaintProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ComplaintStatus status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String handler;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Transient
    public LocalDateTime getTime() {
        return createTime;
    }

    @PrePersist
    public void prePersist() {
        if (createTime == null) {
            createTime = LocalDateTime.now();
        }
    }
}
