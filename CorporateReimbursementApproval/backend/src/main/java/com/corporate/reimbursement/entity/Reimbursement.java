package com.corporate.reimbursement.entity;

import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reimbursement")
public class Reimbursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "reimbursement_no")
    private String reimbursementNo;

    @Column(name = "title")
    private String title;

    @Column(name = "type_id")
    private Long typeId;

    @Column(name = "applicant_id")
    private Long applicantId;

    @Column(name = "dept_id")
    private Long deptId;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "reason")
    private String reason;

    @Column(name = "status")
    private Integer status;

    @Column(name = "current_approver_id")
    private Long currentApproverId;

    @Column(name = "current_approval_level")
    private Integer currentApprovalLevel;

    @Column(name = "submit_time")
    private LocalDateTime submitTime;

    @Column(name = "approval_time")
    private LocalDateTime approvalTime;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "create_time")
    private LocalDateTime createTime;

    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
