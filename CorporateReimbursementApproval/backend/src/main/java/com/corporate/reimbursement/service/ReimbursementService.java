package com.corporate.reimbursement.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.corporate.reimbursement.entity.InvoiceAttachment;
import com.corporate.reimbursement.entity.Reimbursement;
import com.corporate.reimbursement.entity.ReimbursementItem;

import java.util.List;

public interface ReimbursementService {

    Reimbursement createReimbursement(Reimbursement reimbursement, List<ReimbursementItem> items, List<InvoiceAttachment> attachments);

    Reimbursement submitReimbursement(Long id);

    IPage<Reimbursement> getMyReimbursements(Long userId, int page, int size);

    IPage<Reimbursement> getPendingApprovals(Long approverId, int page, int size);

    Reimbursement getDetail(Long id);

    Reimbursement updateReimbursement(Reimbursement reimbursement, List<ReimbursementItem> items, List<InvoiceAttachment> attachments);

    void deleteReimbursement(Long id);
}