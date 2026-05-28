package com.community.gridgovernance.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "work_order_hotspot")
public class WorkOrderHotspot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grid_id", nullable = false)
    private Long gridId;

    @Column(name = "grid_name", nullable = false, length = 100)
    private String gridName;

    @Column(name = "area_name", nullable = false, length = 100)
    private String areaName;

    @Column(name = "order_type", nullable = false, length = 30)
    private String orderType;

    @Column(name = "total_count", nullable = false)
    private Integer totalCount;

    @Column(name = "pending_count", nullable = false)
    private Integer pendingCount;

    @Column(name = "processing_count", nullable = false)
    private Integer processingCount;

    @Column(name = "completed_count", nullable = false)
    private Integer completedCount;

    @Column(name = "overdue_count", nullable = false)
    private Integer overdueCount;

    @Column(name = "avg_process_hours", precision = 10, scale = 2)
    private BigDecimal avgProcessHours;

    @Column(name = "avg_score", precision = 4, scale = 2)
    private BigDecimal avgScore;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
