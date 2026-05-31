package com.port.container.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.port.container.common.PageResult;
import com.port.container.common.R;
import com.port.container.dto.OperationLogQueryDTO;
import com.port.container.entity.OperationLog;
import com.port.container.service.OperationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/log")
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    @GetMapping("/list")
    public R<PageResult<OperationLog>> list(
            @RequestParam(required = false) Long current,
            @RequestParam(required = false) Long size,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) Long businessId,
            @RequestParam(required = false) String businessNo,
            @RequestParam(required = false) Long operatorId,
            @RequestParam(required = false) String operatorName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        OperationLogQueryDTO dto = new OperationLogQueryDTO();
        dto.setModule(module);
        dto.setOperationType(operationType);
        dto.setBusinessId(businessId);
        dto.setBusinessNo(businessNo);
        dto.setOperatorId(operatorId);
        dto.setOperatorName(operatorName);
        dto.setStatus(status);
        dto.setStartTime(startTime);
        dto.setEndTime(endTime);
        dto.setCurrent(current != null ? current : 1L);
        dto.setSize(size != null ? size : 10L);
        IPage<OperationLog> page = operationLogService.queryLogs(dto);
        return R.success(PageResult.of(page));
    }

    @GetMapping("/{id}")
    public R<OperationLog> getById(@PathVariable Long id) {
        return R.success(operationLogService.getById(id));
    }
}
