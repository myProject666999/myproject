package com.db.schema.review.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.db.schema.review.common.Result;
import com.db.schema.review.entity.AuditLog;
import com.db.schema.review.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
@CrossOrigin
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/list")
    public Result<Page<AuditLog>> getAuditLogList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Long userId) {
        Page<AuditLog> page = auditLogService.getAuditLogPage(pageNum, pageSize, module, operation, userId);
        return Result.success(page);
    }
}
