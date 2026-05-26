package com.training.entity;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "training_student", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"training_id", "student_id"})
})
public class TrainingStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "training_id", nullable = false)
    private Long trainingId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "enroll_date")
    private LocalDateTime enrollDate;

    @Column(name = "attendance_count")
    private Integer attendanceCount;

    @Column(name = "total_classes")
    private Integer totalClasses;

    @Column(name = "attendance_rate", precision = 5, scale = 2)
    private BigDecimal attendanceRate;

    @Column(name = "is_completed")
    private Integer isCompleted;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
