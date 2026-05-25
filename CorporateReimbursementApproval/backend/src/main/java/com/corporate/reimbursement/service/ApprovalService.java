package com.corporate.reimbursement.service;

import com.corporate.reimbursement.entity.ApprovalRecord;

import java.util.List;
import java.util.Map;

public interface ApprovalService {

    ApprovalRecord approve(Long reimbursementId, Long approverId, String opinion);

    ApprovalRecord reject(Long reimbursementId, Long approverId, String opinion);

    List<ApprovalRecord> getApprovalRecords(Long reimbursementId);

    Map<String, Object> getApprovalStats(Long userId);
}