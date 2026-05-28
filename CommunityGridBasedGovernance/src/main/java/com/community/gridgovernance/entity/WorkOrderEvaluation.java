package com.community.gridgovernance.entity;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "work_order_evaluation")
public class WorkOrderEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "response_speed_score", nullable = false)
    private Integer responseSpeedScore;

    @Column(name = "process_quality_score", nullable = false)
    private Integer processQualityScore;

    @Column(name = "service_attitude_score", nullable = false)
    private Integer serviceAttitudeScore;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_satisfied", nullable = false)
    private Integer isSatisfied;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
    }
}
