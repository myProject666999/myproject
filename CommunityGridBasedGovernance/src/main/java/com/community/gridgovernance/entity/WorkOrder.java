package com.community.gridgovernance.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "work_order")
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, length = 32)
    private String orderNo;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_type", nullable = false, length = 30)
    private String orderType;

    @Column(name = "level", nullable = false, length = 20)
    private String level;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "reporter_name", nullable = false, length = 50)
    private String reporterName;

    @Column(name = "reporter_phone", nullable = false, length = 20)
    private String reporterPhone;

    @Column(name = "grid_id")
    private Long gridId;

    @Column(name = "grid_worker_id")
    private Long gridWorkerId;

    @Column(name = "grid_worker_name", length = 50)
    private String gridWorkerName;

    @Column(name = "lng", nullable = false, precision = 11, scale = 8)
    private BigDecimal lng;

    @Column(name = "lat", nullable = false, precision = 10, scale = 8)
    private BigDecimal lat;

    @Column(name = "address", nullable = false, length = 300)
    private String address;

    @Column(name = "before_images", columnDefinition = "TEXT")
    private String beforeImages;

    @Column(name = "after_images", columnDefinition = "TEXT")
    private String afterImages;

    @Column(name = "process_result", columnDefinition = "TEXT")
    private String processResult;

    @Column(name = "assign_time")
    private LocalDateTime assignTime;

    @Column(name = "process_start_time")
    private LocalDateTime processStartTime;

    @Column(name = "complete_time")
    private LocalDateTime completeTime;

    @Column(name = "expect_complete_time")
    private LocalDateTime expectCompleteTime;

    @Column(name = "escalation_count", nullable = false)
    private Integer escalationCount;

    @Column(name = "last_escalation_time")
    private LocalDateTime lastEscalationTime;

    @Column(name = "is_overdue", nullable = false)
    private Integer isOverdue;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        if (escalationCount == null) {
            escalationCount = 0;
        }
        if (isOverdue == null) {
            isOverdue = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
