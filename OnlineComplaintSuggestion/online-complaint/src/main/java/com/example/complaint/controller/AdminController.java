package com.example.complaint.controller;

import com.example.complaint.common.Result;
import com.example.complaint.entity.Complaint;
import com.example.complaint.enums.ComplaintStatus;
import com.example.complaint.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/complaints")
    public Result<List<Complaint>> getComplaints(
            @RequestParam(value = "status", required = false) String status) {
        if (status == null || status.isBlank()) {
            return Result.success(adminService.getAllComplaints());
        }
        try {
            ComplaintStatus s = ComplaintStatus.valueOf(status.toUpperCase());
            return Result.success(adminService.getByStatus(s));
        } catch (Exception e) {
            return Result.success(adminService.getAllComplaints());
        }
    }

    @PutMapping("/complaints/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ComplaintStatus status = null;
        String statusStr = body.get("status") == null ? null : body.get("status").toString();
        if (statusStr != null) {
            try {
                status = ComplaintStatus.valueOf(statusStr.toUpperCase());
            } catch (Exception e) {
                return Result.error("无效的状态值");
            }
        }
        String description = body.get("description") == null ? null : body.get("description").toString();
        String handler = body.get("handler") == null ? null : body.get("handler").toString();

        boolean ok = adminService.updateStatus(id, status, description, handler);
        if (!ok) {
            return Result.error("更新失败");
        }
        return Result.success();
    }
}
