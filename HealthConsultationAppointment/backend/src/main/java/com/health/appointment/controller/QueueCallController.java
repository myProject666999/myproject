package com.health.appointment.controller;

import com.health.appointment.common.Result;
import com.health.appointment.entity.QueueCall;
import com.health.appointment.service.QueueCallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/queue-calls")
public class QueueCallController {

    @Autowired
    private QueueCallService queueCallService;

    @GetMapping
    public Result<List<QueueCall>> getQueueCalls(
            @RequestParam Long scheduleId,
            @RequestParam Long doctorId,
            @RequestParam(required = false) Boolean waiting) {
        List<QueueCall> queueCalls;
        if (Boolean.TRUE.equals(waiting)) {
            queueCalls = queueCallService.getWaitingQueue(scheduleId, doctorId);
        } else {
            queueCalls = queueCallService.getQueueCalls(scheduleId, doctorId);
        }
        return Result.success(queueCalls);
    }

    @GetMapping("/current")
    public Result<QueueCall> getCurrentCalling(
            @RequestParam Long scheduleId,
            @RequestParam Long doctorId) {
        return Result.success(queueCallService.getCurrentCalling(scheduleId, doctorId));
    }

    @PostMapping("/call-next")
    public Result<QueueCall> callNext(@RequestBody Map<String, Long> params) {
        try {
            Long scheduleId = params.get("scheduleId");
            Long doctorId = params.get("doctorId");
            QueueCall queueCall = queueCallService.callNext(scheduleId, doctorId);
            return Result.success(queueCall);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/recall")
    public Result<QueueCall> recall(@PathVariable Long id) {
        try {
            QueueCall queueCall = queueCallService.recall(id);
            return Result.success(queueCall);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/visited")
    public Result<QueueCall> markVisited(@PathVariable Long id) {
        try {
            QueueCall queueCall = queueCallService.markVisited(id);
            return Result.success(queueCall);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/missed")
    public Result<QueueCall> markMissed(@PathVariable Long id) {
        try {
            QueueCall queueCall = queueCallService.markMissed(id);
            return Result.success(queueCall);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
