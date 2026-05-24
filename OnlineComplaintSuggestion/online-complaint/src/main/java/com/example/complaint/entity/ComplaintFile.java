package com.example.complaint.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "complaint_file")
public class ComplaintFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "upload_time")
    private LocalDateTime uploadTime;

    @PrePersist
    public void prePersist() {
        if (uploadTime == null) {
            uploadTime = LocalDateTime.now();
        }
    }
}
