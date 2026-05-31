package com.db.schema.review.controller;

import com.db.schema.review.common.Result;
import com.db.schema.review.entity.ExecutionRecord;
import com.db.schema.review.service.ExecutionService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/execution")
@CrossOrigin
public class ExecutionController {

    @Autowired
    private ExecutionService executionService;

    @PostMapping("/start/{orderId}")
    public Result<ExecutionRecord> startExecution(@PathVariable Long orderId) {
        ExecutionRecord record = executionService.startExecution(orderId);
        return Result.success(record);
    }

    @PostMapping("/stop/{executionId}")
    public Result<Void> stopExecution(@PathVariable Long executionId) {
        executionService.stopExecution(executionId);
        return Result.success();
    }

    @PostMapping("/pause/{executionId}")
    public Result<Void> pauseExecution(@PathVariable Long executionId) {
        executionService.pauseExecution(executionId);
        return Result.success();
    }

    @PostMapping("/resume/{executionId}")
    public Result<Void> resumeExecution(@PathVariable Long executionId) {
        executionService.resumeExecution(executionId);
        return Result.success();
    }

    @PostMapping("/rollback/{orderId}")
    public Result<ExecutionRecord> rollback(@PathVariable Long orderId) {
        ExecutionRecord record = executionService.rollback(orderId);
        return Result.success(record);
    }

    @GetMapping("/{executionId}")
    public Result<ExecutionRecord> getExecutionRecord(@PathVariable Long executionId) {
        ExecutionRecord record = executionService.getExecutionRecord(executionId);
        return Result.success(record);
    }

    @GetMapping("/order/{orderId}")
    public Result<List<ExecutionRecord>> getExecutionRecords(@PathVariable Long orderId) {
        List<ExecutionRecord> list = executionService.getExecutionRecords(orderId);
        return Result.success(list);
    }
}
