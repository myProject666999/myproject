package com.corporate.reimbursement.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.*;
import com.corporate.reimbursement.mapper.*;
import com.corporate.reimbursement.service.ApprovalService;
import com.corporate.reimbursement.service.ReimbursementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/approval")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @Autowired
    private ReimbursementService reimbursementService;

    @Autowired
    private ReimbursementTypeMapper reimbursementTypeMapper;

    @Autowired
    private SysUserMapper sysUserMapper;

    private Long getCurrentUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        return userIdStr != null ? Long.parseLong(userIdStr) : 1L;
    }

    @GetMapping("/pending")
    public Result<IPage<Map<String, Object>>> pending(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = getCurrentUserId(request);
        IPage<Reimbursement> page = reimbursementService.getPendingApprovals(userId, pageNum, pageSize);

        List<Map<String, Object>> records = new ArrayList<>();
        for (Reimbursement r : page.getRecords()) {
            records.add(convertToMap(r));
        }

        IPage<Map<String, Object>> pageResult = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        pageResult.setRecords(records);
        return Result.success(pageResult);
    }

    @PostMapping("/approve/{id}")
    public Result<ApprovalRecord> approve(@PathVariable Long id, @RequestBody Map<String, String> params, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        String opinion = params.get("opinion");
        ApprovalRecord record = approvalService.approve(id, userId, opinion);
        return Result.success("审批通过", record);
    }

    @PostMapping("/reject/{id}")
    public Result<ApprovalRecord> reject(@PathVariable Long id, @RequestBody Map<String, String> params, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        String opinion = params.get("opinion");
        ApprovalRecord record = approvalService.reject(id, userId, opinion);
        return Result.success("已驳回", record);
    }

    @GetMapping("/records/{id}")
    public Result<List<ApprovalRecord>> records(@PathVariable Long id) {
        List<ApprovalRecord> records = approvalService.getApprovalRecords(id);
        return Result.success(records);
    }

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        Map<String, Object> data = approvalService.getApprovalStats(userId);
        return Result.success(data);
    }

    private Map<String, Object> convertToMap(Reimbursement r) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", r.getId());
        map.put("reimburseNo", r.getReimbursementNo());
        map.put("title", r.getTitle());
        map.put("typeId", r.getTypeId());
        map.put("applicantId", r.getApplicantId());
        map.put("deptId", r.getDeptId());
        map.put("totalAmount", r.getTotalAmount());
        map.put("reason", r.getReason());
        map.put("status", r.getStatus());
        map.put("currentApproverId", r.getCurrentApproverId());
        map.put("currentApprovalLevel", r.getCurrentApprovalLevel());
        map.put("submitTime", r.getSubmitTime());
        map.put("approvalTime", r.getApprovalTime());
        map.put("paymentTime", r.getPaymentTime());
        map.put("createTime", r.getCreateTime());

        if (r.getTypeId() != null) {
            ReimbursementType type = reimbursementTypeMapper.selectById(r.getTypeId());
            if (type != null) {
                map.put("typeCode", type.getTypeCode());
                map.put("typeName", type.getTypeName());
            }
        }

        if (r.getApplicantId() != null) {
            SysUser user = sysUserMapper.selectById(r.getApplicantId());
            if (user != null) {
                map.put("applicantName", user.getRealName());
                map.put("applicantEmployeeNo", user.getEmployeeNo());
            }
        }

        if (r.getCurrentApproverId() != null) {
            SysUser approver = sysUserMapper.selectById(r.getCurrentApproverId());
            if (approver != null) {
                map.put("currentApproverName", approver.getRealName());
            }
        }

        return map;
    }
}