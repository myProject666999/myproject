package com.workorder.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.workorder.common.Result;
import com.workorder.dto.TicketAssignDTO;
import com.workorder.dto.TicketCreateDTO;
import com.workorder.dto.TicketQueryDTO;
import com.workorder.dto.TicketReplyDTO;
import com.workorder.entity.Ticket;
import com.workorder.entity.TicketReply;
import com.workorder.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public Result<Ticket> createTicket(@Valid @RequestBody TicketCreateDTO dto) {
        return Result.success("工单创建成功", ticketService.createTicket(dto));
    }

    @GetMapping("/{id}")
    public Result<Ticket> getTicketById(@PathVariable Long id) {
        return Result.success(ticketService.getTicketById(id));
    }

    @GetMapping("/page")
    public Result<Page<Ticket>> getTicketPage(TicketQueryDTO dto) {
        return Result.success(ticketService.getTicketPage(dto));
    }

    @PostMapping("/assign")
    public Result<Ticket> assignTicket(@Valid @RequestBody TicketAssignDTO dto) {
        return Result.success("工单分配成功", ticketService.assignTicket(dto));
    }

    @PutMapping("/{id}/status")
    public Result<Ticket> updateStatus(@PathVariable Long id,
                                       @RequestParam String status,
                                       @RequestParam Long operatorId) {
        return Result.success("状态更新成功", ticketService.updateStatus(id, status, operatorId));
    }

    @PostMapping("/reply")
    public Result<TicketReply> replyTicket(@Valid @RequestBody TicketReplyDTO dto) {
        return Result.success("回复成功", ticketService.replyTicket(dto));
    }

    @GetMapping("/{id}/replies")
    public Result<List<TicketReply>> getReplies(@PathVariable Long id) {
        return Result.success(ticketService.getRepliesByTicketId(id));
    }

    @GetMapping("/statistics/status")
    public Result<List<Map<String, Object>>> getStatusStatistics() {
        return Result.success(ticketService.getStatusStatistics());
    }

    @GetMapping("/statistics/priority")
    public Result<List<Map<String, Object>>> getPriorityStatistics() {
        return Result.success(ticketService.getPriorityStatistics());
    }

    @GetMapping("/statistics/date")
    public Result<List<Map<String, Object>>> getDateStatistics() {
        return Result.success(ticketService.getDateStatistics());
    }

    @GetMapping("/statistics/agent")
    public Result<List<Map<String, Object>>> getAgentStatistics() {
        return Result.success(ticketService.getAgentStatistics());
    }
}