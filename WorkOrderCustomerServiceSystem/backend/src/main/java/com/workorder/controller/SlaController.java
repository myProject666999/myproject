package com.workorder.controller;

import com.workorder.common.Result;
import com.workorder.entity.Ticket;
import com.workorder.service.SlaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sla")
@RequiredArgsConstructor
public class SlaController {

    private final SlaService slaService;

    @PostMapping("/check-warning")
    public Result<Void> checkSlaWarning() {
        slaService.checkSlaWarning();
        return Result.success("SLA预警检查完成", null);
    }

    @PostMapping("/check-overdue")
    public Result<Void> checkSlaOverdue() {
        slaService.checkSlaOverdue();
        return Result.success("SLA超时检查完成", null);
    }

    @GetMapping("/warning")
    public Result<List<Ticket>> getWarningTickets() {
        return Result.success(slaService.getWarningTickets());
    }

    @GetMapping("/overdue")
    public Result<List<Ticket>> getOverdueTickets() {
        return Result.success(slaService.getOverdueTickets());
    }
}