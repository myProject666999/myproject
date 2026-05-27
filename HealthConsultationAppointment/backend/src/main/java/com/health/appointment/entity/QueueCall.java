package com.health.appointment.entity;

import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "queue_call")
public class QueueCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id", nullable = false)
    private Long appointmentId;

    @Column(name = "schedule_id", nullable = false)
    private Long scheduleId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "patient_name", nullable = false, length = 50)
    private String patientName;

    @Column(name = "queue_number", nullable = false)
    private Integer queueNumber;

    @Column(name = "call_count")
    private Integer callCount = 0;

    private Integer status = 0;

    @Column(name = "first_call_time")
    private LocalDateTime firstCallTime;

    @Column(name = "last_call_time")
    private LocalDateTime lastCallTime;

    @CreationTimestamp
    @Column(name = "created_time", updatable = false)
    private LocalDateTime createdTime;

    @UpdateTimestamp
    @Column(name = "updated_time")
    private LocalDateTime updatedTime;

    @Transient
    private Appointment appointment;
}
