package com.corporate.reimbursement.controller;

import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.ApprovalRecord;
import com.corporate.reimbursement.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approval")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    private Long getCurrentUserId(HttpServletRequest request) {
        String userIdStr = request.getHeader("X-User-Id");
        return userIdStr != null ? Long.parseLong(userIdStr) : 1L;
    }

    @GetMapping("/pending")
    public Result<Map<String, Object>> pending(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        Map<String, Object> data = approvalService.getApprovalStats(userId);
        return Result.success(data);
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
}