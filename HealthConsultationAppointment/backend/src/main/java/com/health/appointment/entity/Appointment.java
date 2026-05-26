package com.health.appointment.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "appointment")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_no", nullable = false, length = 32, unique = true)
    private String appointmentNo;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "time_period", nullable = false, length = 20)
    private String timePeriod;

    @Column(name = "queue_number")
    private Integer queueNumber;

    @Column(name = "consult_fee", precision = 10, scale = 2)
    private BigDecimal consultFee = BigDecimal.ZERO;

    private Integer status = 1;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "cancel_time")
    private LocalDateTime cancelTime;

    @Column(name = "visit_time")
    private LocalDateTime visitTime;

    @CreationTimestamp
    @Column(name = "created_time", updatable = false)
    private LocalDateTime createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @Transient
    private Patient patient;

    @Transient
    private Doctor doctor;

    @Transient
    private Department department;

    @Transient
    private Schedule schedule;
}
