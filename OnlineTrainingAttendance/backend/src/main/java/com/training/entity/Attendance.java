package com.training.entity;

import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "attendance", indexes = {
        @Index(name = "idx_training_date", columnList = "training_id, check_in_time")
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "training_id", nullable = false)
    private Long trainingId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_in_type")
    private Integer checkInType;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "device_info", length = 500)
    private String deviceInfo;

    @Column(name = "remark", length = 500)
    private String remark;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
