package com.corporate.reimbursement.entity;

import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "approval_record")
public class ApprovalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "reimbursement_id")
    private Long reimbursementId;

    @Column(name = "approver_id")
    private Long approverId;

    @Column(name = "approver_name")
    private String approverName;

    @Column(name = "approval_level")
    private Integer approvalLevel;

    @Column(name = "approval_action")
    private String approvalAction;

    @Column(name = "opinion")
    private String opinion;

    @Column(name = "approval_time")
    private LocalDateTime approvalTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;
}
