package com.community.gridgovernance.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "work_order_log")
public class WorkOrderLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "operator_id", nullable = false)
    private Long operatorId;

    @Column(name = "operator_name", nullable = false, length = 50)
    private String operatorName;

    @Column(name = "operation_type", nullable = false, length = 50)
    private String operationType;

    @Column(name = "before_status", length = 30)
    private String beforeStatus;

    @Column(name = "after_status", length = 30)
    private String afterStatus;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;

    @Column(name = "images", columnDefinition = "TEXT")
    private String images;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
}
