package com.micro.frontend.controller;

import com.micro.frontend.common.PageResult;
import com.micro.frontend.common.Result;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AuditLog;
import com.micro.frontend.service.IAuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    @Autowired
    private IAuditLogService auditLogService;

    @GetMapping("/{id}")
    public Result<AuditLog> getById(@PathVariable Long id) {
        return Result.success(auditLogService.getById(id));
    }

    @GetMapping("/page")
    public Result<PageResult<AuditLog>> page(PageQueryDTO query) {
        return Result.success(auditLogService.page(query));
    }

    @GetMapping("/list")
    public Result<List<AuditLog>> list(PageQueryDTO query) {
        return Result.success(auditLogService.list(query));
    }

    @GetMapping("/target")
    public Result<List<AuditLog>> getByTarget(
            @RequestParam String targetTable,
            @RequestParam Long targetId) {
        return Result.success(auditLogService.getByTarget(targetTable, targetId));
    }
}
