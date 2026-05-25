package com.corporate.reimbursement.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.corporate.reimbursement.common.ReimbursementStatus;
import com.corporate.reimbursement.entity.ApprovalFlowConfig;
import com.corporate.reimbursement.entity.InvoiceAttachment;
import com.corporate.reimbursement.entity.Reimbursement;
import com.corporate.reimbursement.entity.ReimbursementItem;
import com.corporate.reimbursement.entity.ReimbursementType;
import com.corporate.reimbursement.entity.SysUser;
import com.corporate.reimbursement.entity.SysUserRole;
import com.corporate.reimbursement.mapper.ApprovalFlowConfigMapper;
import com.corporate.reimbursement.mapper.InvoiceAttachmentMapper;
import com.corporate.reimbursement.mapper.ReimbursementItemMapper;
import com.corporate.reimbursement.mapper.ReimbursementMapper;
import com.corporate.reimbursement.mapper.ReimbursementTypeMapper;
import com.corporate.reimbursement.mapper.SysUserMapper;
import com.corporate.reimbursement.mapper.SysUserRoleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReimbursementServiceImpl implements ReimbursementService {

    @Autowired
    private ReimbursementMapper reimbursementMapper;

    @Autowired
    private ReimbursementItemMapper reimbursementItemMapper;

    @Autowired
    private InvoiceAttachmentMapper invoiceAttachmentMapper;

    @Autowired
    private ApprovalFlowConfigMapper approvalFlowConfigMapper;

    @Autowired
    private ReimbursementTypeMapper reimbursementTypeMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private SysUserRoleMapper sysUserRoleMapper;

    @Override
    @Transactional
    public Reimbursement createReimbursement(Reimbursement reimbursement, List<ReimbursementItem> items, List<InvoiceAttachment> attachments) {
        String reimbursementNo = generateReimbursementNo();
        reimbursement.setReimbursementNo(reimbursementNo);

        BigDecimal totalAmount = calculateTotalAmount(items);
        reimbursement.setTotalAmount(totalAmount);

        validateAmount(reimbursement.getTypeId(), totalAmount);

        if (reimbursement.getStatus() == null || reimbursement.getStatus().isEmpty()) {
            reimbursement.setStatus(ReimbursementStatus.DRAFT.getCode());
        }
        reimbursement.setCreateTime(LocalDateTime.now());
        reimbursement.setUpdateTime(LocalDateTime.now());

        reimbursementMapper.insert(reimbursement);

        if (items != null) {
            for (ReimbursementItem item : items) {
                item.setReimbursementId(reimbursement.getId());
                item.setCreateTime(LocalDateTime.now());
                reimbursementItemMapper.insert(item);
            }
        }

        if (attachments != null) {
            for (InvoiceAttachment attachment : attachments) {
                attachment.setReimbursementId(reimbursement.getId());
                attachment.setCreateTime(LocalDateTime.now());
                invoiceAttachmentMapper.insert(attachment);
            }
        }

        return reimbursement;
    }

    @Override
    @Transactional
    public Reimbursement submitReimbursement(Long id) {
        Reimbursement reimbursement = reimbursementMapper.selectById(id);
        if (reimbursement == null) {
            throw new RuntimeException("报销单不存在");
        }
        if (!ReimbursementStatus.DRAFT.getCode().equals(reimbursement.getStatus())) {
            throw new RuntimeException("只有草稿状态可以提交");
        }

        QueryWrapper<ApprovalFlowConfig> flowWrapper = new QueryWrapper<>();
        flowWrapper.eq("type_id", reimbursement.getTypeId())
                .and(w -> w.isNull("dept_id").or().eq("dept_id", reimbursement.getDeptId()))
                .le("min_amount", reimbursement.getTotalAmount())
                .ge("max_amount", reimbursement.getTotalAmount())
                .eq("status", 1)
                .orderByAsc("approval_level");
        List<ApprovalFlowConfig> flowConfigs = approvalFlowConfigMapper.selectList(flowWrapper);

        if (flowConfigs.isEmpty()) {
            throw new RuntimeException("未找到审批流程配置");
        }

        ApprovalFlowConfig firstConfig = flowConfigs.get(0);
        Long approverId = firstConfig.getApproverUserId();
        if (approverId == null) {
            approverId = findApproverByRole(firstConfig.getApproverRoleId());
        }

        reimbursement.setCurrentApproverId(approverId);
        reimbursement.setCurrentApprovalLevel(firstConfig.getApprovalLevel());
        reimbursement.setStatus(ReimbursementStatus.PENDING.getCode());
        reimbursement.setSubmitTime(LocalDateTime.now());
        reimbursement.setUpdateTime(LocalDateTime.now());

        reimbursementMapper.updateById(reimbursement);
        return reimbursement;
    }

    private Long findApproverByRole(Long roleId) {
        QueryWrapper<SysUserRole> roleWrapper = new QueryWrapper<>();
        roleWrapper.eq("role_id", roleId);
        List<SysUserRole> userRoles = sysUserRoleMapper.selectList(roleWrapper);
        if (!userRoles.isEmpty()) {
            return userRoles.get(0).getUserId();
        }
        throw new RuntimeException("未找到对应角色的审批人");
    }

    @Override
    public IPage<Reimbursement> getMyReimbursements(Long userId, int page, int size) {
        QueryWrapper<Reimbursement> wrapper = new QueryWrapper<>();
        wrapper.eq("applicant_id", userId)
                .orderByDesc("create_time");
        return reimbursementMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public IPage<Reimbursement> getPendingApprovals(Long approverId, int page, int size) {
        QueryWrapper<Reimbursement> wrapper = new QueryWrapper<>();
        wrapper.eq("current_approver_id", approverId)
                .eq("status", ReimbursementStatus.PENDING.getCode())
                .orderByDesc("submit_time");
        return reimbursementMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Reimbursement getDetail(Long id) {
        return reimbursementMapper.selectById(id);
    }

    @Override
    @Transactional
    public Reimbursement updateReimbursement(Reimbursement reimbursement, List<ReimbursementItem> items, List<InvoiceAttachment> attachments) {
        Reimbursement existing = reimbursementMapper.selectById(reimbursement.getId());
        if (existing == null) {
            throw new RuntimeException("报销单不存在");
        }
        if (!ReimbursementStatus.DRAFT.getCode().equals(existing.getStatus())) {
            throw new RuntimeException("只有草稿状态可以修改");
        }

        existing.setTitle(reimbursement.getTitle());
        existing.setTypeId(reimbursement.getTypeId());
        existing.setReason(reimbursement.getReason());
        existing.setUpdateTime(LocalDateTime.now());

        if (items != null) {
            BigDecimal totalAmount = calculateTotalAmount(items);
            existing.setTotalAmount(totalAmount);
            validateAmount(reimbursement.getTypeId(), totalAmount);
        }

        reimbursementMapper.updateById(existing);

        if (items != null) {
            QueryWrapper<ReimbursementItem> itemWrapper = new QueryWrapper<>();
            itemWrapper.eq("reimbursement_id", existing.getId());
            reimbursementItemMapper.delete(itemWrapper);

            for (ReimbursementItem item : items) {
                item.setReimbursementId(existing.getId());
                item.setCreateTime(LocalDateTime.now());
                reimbursementItemMapper.insert(item);
            }
        }

        if (attachments != null) {
            QueryWrapper<InvoiceAttachment> attWrapper = new QueryWrapper<>();
            attWrapper.eq("reimbursement_id", existing.getId());
            invoiceAttachmentMapper.delete(attWrapper);

            for (InvoiceAttachment attachment : attachments) {
                attachment.setReimbursementId(existing.getId());
                attachment.setCreateTime(LocalDateTime.now());
                invoiceAttachmentMapper.insert(attachment);
            }
        }

        return existing;
    }

    @Override
    @Transactional
    public void deleteReimbursement(Long id) {
        Reimbursement existing = reimbursementMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("报销单不存在");
        }
        if (!ReimbursementStatus.DRAFT.getCode().equals(existing.getStatus())) {
            throw new RuntimeException("只有草稿状态可以删除");
        }

        QueryWrapper<ReimbursementItem> itemWrapper = new QueryWrapper<>();
        itemWrapper.eq("reimbursement_id", id);
        reimbursementItemMapper.delete(itemWrapper);

        QueryWrapper<InvoiceAttachment> attWrapper = new QueryWrapper<>();
        attWrapper.eq("reimbursement_id", id);
        invoiceAttachmentMapper.delete(attWrapper);

        reimbursementMapper.deleteById(id);
    }

    private String generateReimbursementNo() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "BX" + dateStr;

        QueryWrapper<Reimbursement> wrapper = new QueryWrapper<>();
        wrapper.likeRight("reimbursement_no", prefix)
                .orderByDesc("reimbursement_no")
                .last("LIMIT 1");
        Reimbursement lastOne = reimbursementMapper.selectOne(wrapper);

        int seq = 1;
        if (lastOne != null && lastOne.getReimbursementNo() != null) {
            String lastNo = lastOne.getReimbursementNo();
            String lastSeq = lastNo.substring(prefix.length());
            try {
                seq = Integer.parseInt(lastSeq) + 1;
            } catch (NumberFormatException e) {
                seq = 1;
            }
        }

        return prefix + String.format("%04d", seq);
    }

    private BigDecimal calculateTotalAmount(List<ReimbursementItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (ReimbursementItem item : items) {
            BigDecimal itemAmount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            total = total.add(itemAmount);
        }
        return total;
    }

    private void validateAmount(Long typeId, BigDecimal totalAmount) {
        if (typeId != null) {
            ReimbursementType type = reimbursementTypeMapper.selectById(typeId);
            if (type != null && type.getMaxAmount() != null) {
                if (totalAmount.compareTo(type.getMaxAmount()) > 0) {
                    throw new RuntimeException("报销金额超过类型最大限额: " + type.getMaxAmount());
                }
            }
        }
    }
}