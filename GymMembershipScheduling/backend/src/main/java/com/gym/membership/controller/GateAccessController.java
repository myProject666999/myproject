package com.gym.membership.controller;

import com.gym.membership.common.PageResult;
import com.gym.membership.common.Result;
import com.gym.membership.dto.GateAccessDTO;
import com.gym.membership.entity.GateRecord;
import com.gym.membership.service.GateAccessService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/gate")
public class GateAccessController {

    private final GateAccessService gateAccessService;

    public GateAccessController(GateAccessService gateAccessService) {
        this.gateAccessService = gateAccessService;
    }

    @PostMapping("/access")
    public Result<GateRecord> handleAccess(@Validated @RequestBody GateAccessDTO dto) {
        GateRecord record = gateAccessService.handleAccess(dto);
        return Result.success("操作成功", record);
    }

    @GetMapping("/records")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECEPTION')")
    public Result<PageResult<GateRecord>> getRecordPage(
            @RequestParam(defaultValue = "1") Long pageNum,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String gateNo,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        PageResult<GateRecord> result = gateAccessService.getRecordPage(
                pageNum, pageSize, userId, gateNo, startDate, endDate);
        return Result.success(result);
    }
}
