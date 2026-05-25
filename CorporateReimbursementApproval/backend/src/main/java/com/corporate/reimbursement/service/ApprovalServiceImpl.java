package com.corporate.reimbursement.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.corporate.reimbursement.common.ApprovalAction;
import com.corporate.reimbursement.common.ReimbursementStatus;
import com.corporate.reimbursement.entity.ApprovalFlowConfig;
import com.corporate.reimbursement.entity.ApprovalRecord;
import com.corporate.reimbursement.entity.Reimbursement;
import com.corporate.reimbursement.entity.SysUser;
import com.corporate.reimbursement.mapper.ApprovalFlowConfigMapper;
import com.corporate.reimbursement.mapper.ApprovalRecordMapper;
import com.corporate.reimbursement.mapper.ReimbursementMapper;
import com.corporate.reimbursement.mapper.SysUserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApprovalServiceImpl implements ApprovalService {

    @Autowired
    private ApprovalRecordMapper approvalRecordMapper;

    @Autowired
    private ReimbursementMapper reimbursementMapper;

    @Autowired
    private ApprovalFlowConfigMapper approvalFlowConfigMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public ApprovalRecord approve(Long reimbursementId, Long approverId, String opinion) {
        Reimbursement reimbursement = reimbursementMapper.selectById(reimbursementId);
        if (reimbursement == null) {
            throw new RuntimeException("报销单不存在");
        }
        if (!ReimbursementStatus.PENDING.getCode().equals(reimbursement.getStatus())) {
            throw new RuntimeException("当前状态不支持审批");
        }
        if (!approverId.equals(reimbursement.getCurrentApproverId())) {
            throw new RuntimeException("您不是当前审批人");
        }

        SysUser approver = sysUserMapper.selectById(approverId);
        ApprovalRecord record = new ApprovalRecord();
        record.setReimbursementId(reimbursementId);
        record.setApproverId(approverId);
        record.setApproverName(approver != null ? approver.getRealName() : "");
        record.setApprovalLevel(reimbursement.getCurrentApprovalLevel());
        record.setApprovalAction(ApprovalAction.APPROVED.name());
        record.setOpinion(opinion);
        record.setApprovalTime(LocalDateTime.now());
        record.setCreateTime(LocalDateTime.now());
        approvalRecordMapper.insert(record);

        QueryWrapper<ApprovalFlowConfig> flowWrapper = new QueryWrapper<>();
        flowWrapper.eq("type_id", reimbursement.getTypeId())
                .eq("dept_id", reimbursement.getDeptId())
                .le("min_amount", reimbursement.getTotalAmount())
                .ge("max_amount", reimbursement.getTotalAmount())
                .eq("status", 1)
                .gt("approval_level", reimbursement.getCurrentApprovalLevel())
                .orderByAsc("approval_level")
                .last("LIMIT 1");
        ApprovalFlowConfig nextConfig = approvalFlowConfigMapper.selectOne(flowWrapper);

        if (nextConfig != null) {
            reimbursement.setCurrentApproverId(nextConfig.getApproverUserId());
            reimbursement.setCurrentApprovalLevel(nextConfig.getApprovalLevel());
            reimbursement.setUpdateTime(LocalDateTime.now());
            reimbursementMapper.updateById(reimbursement);
        } else {
            reimbursement.setStatus(ReimbursementStatus.APPROVED.getCode());
            reimbursement.setApprovalTime(LocalDateTime.now());
            reimbursement.setCurrentApproverId(null);
            reimbursement.setUpdateTime(LocalDateTime.now());
            reimbursementMapper.updateById(reimbursement);
        }

        return record;
    }

    @Override
    @Transactional
    public ApprovalRecord reject(Long reimbursementId, Long approverId, String opinion) {
        Reimbursement reimbursement = reimbursementMapper.selectById(reimbursementId);
        if (reimbursement == null) {
            throw new RuntimeException("报销单不存在");
        }
        if (!ReimbursementStatus.PENDING.getCode().equals(reimbursement.getStatus())) {
            throw new RuntimeException("当前状态不支持审批");
        }
        if (!approverId.equals(reimbursement.getCurrentApproverId())) {
            throw new RuntimeException("您不是当前审批人");
        }

        SysUser approver = sysUserMapper.selectById(approverId);
        ApprovalRecord record = new ApprovalRecord();
        record.setReimbursementId(reimbursementId);
        record.setApproverId(approverId);
        record.setApproverName(approver != null ? approver.getRealName() : "");
        record.setApprovalLevel(reimbursement.getCurrentApprovalLevel());
        record.setApprovalAction(ApprovalAction.REJECTED.name());
        record.setOpinion(opinion);
        record.setApprovalTime(LocalDateTime.now());
        record.setCreateTime(LocalDateTime.now());
        approvalRecordMapper.insert(record);

        reimbursement.setStatus(ReimbursementStatus.REJECTED.getCode());
        reimbursement.setApprovalTime(LocalDateTime.now());
        reimbursement.setCurrentApproverId(null);
        reimbursement.setUpdateTime(LocalDateTime.now());
        reimbursementMapper.updateById(reimbursement);

        return record;
    }

    @Override
    public List<ApprovalRecord> getApprovalRecords(Long reimbursementId) {
        QueryWrapper<ApprovalRecord> wrapper = new QueryWrapper<>();
        wrapper.eq("reimbursement_id", reimbursementId)
                .orderByAsc("approval_level", "create_time");
        return approvalRecordMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> getApprovalStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();

        QueryWrapper<Reimbursement> pendingWrapper = new QueryWrapper<>();
        pendingWrapper.eq("current_approver_id", userId)
                .eq("status", ReimbursementStatus.PENDING.getCode());
        Long pendingCount = reimbursementMapper.selectCount(pendingWrapper);
        stats.put("pendingCount", pendingCount);

        QueryWrapper<Reimbursement> submittedWrapper = new QueryWrapper<>();
        submittedWrapper.eq("applicant_id", userId);
        Long submittedCount = reimbursementMapper.selectCount(submittedWrapper);
        stats.put("submittedCount", submittedCount);

        return stats;
    }
}