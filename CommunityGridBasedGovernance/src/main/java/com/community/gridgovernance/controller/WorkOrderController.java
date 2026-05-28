package com.community.gridgovernance.controller;

import com.community.gridgovernance.common.Result;
import com.community.gridgovernance.dto.WorkOrderEvaluationDTO;
import com.community.gridgovernance.dto.WorkOrderProcessDTO;
import com.community.gridgovernance.dto.WorkOrderReportDTO;
import com.community.gridgovernance.entity.WorkOrder;
import com.community.gridgovernance.entity.WorkOrderEvaluation;
import com.community.gridgovernance.entity.WorkOrderLog;
import com.community.gridgovernance.service.WorkOrderEvaluationService;
import com.community.gridgovernance.service.WorkOrderLogService;
import com.community.gridgovernance.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private WorkOrderLogService workOrderLogService;

    @Autowired
    private WorkOrderEvaluationService evaluationService;

    @PostMapping("/report")
    public Result<WorkOrder> reportOrder(@Validated @RequestBody WorkOrderReportDTO dto) {
        WorkOrder order = workOrderService.reportOrder(dto);
        return Result.success("工单上报成功", order);
    }

    @GetMapping("/{id}")
    public Result<WorkOrder> getOrderById(@PathVariable Long id) {
        return Result.success(workOrderService.getOrderById(id));
    }

    @GetMapping("/list")
    public Result<List<WorkOrder>> getAllOrders() {
        return Result.success(workOrderService.getAllOrders());
    }

    @GetMapping("/pending")
    public Result<List<WorkOrder>> getPendingOrders() {
        return Result.success(workOrderService.getPendingOrders());
    }

    @GetMapping("/reporter/{reporterId}")
    public Result<List<WorkOrder>> getOrdersByReporter(@PathVariable Long reporterId) {
        return Result.success(workOrderService.getOrdersByReporter(reporterId));
    }

    @GetMapping("/worker/{workerId}")
    public Result<List<WorkOrder>> getOrdersByWorker(@PathVariable Long workerId) {
        return Result.success(workOrderService.getOrdersByWorker(workerId));
    }

    @GetMapping("/status/{status}")
    public Result<List<WorkOrder>> getOrdersByStatus(@PathVariable String status) {
        return Result.success(workOrderService.getOrdersByStatus(status));
    }

    @PostMapping("/accept")
    public Result<WorkOrder> acceptOrder(@RequestParam Long orderId, @RequestParam Long workerId) {
        WorkOrder order = workOrderService.acceptOrder(orderId, workerId);
        return Result.success("接单成功", order);
    }

    @PostMapping("/process")
    public Result<WorkOrder> processOrder(@Validated @RequestBody WorkOrderProcessDTO dto) {
        WorkOrder order = workOrderService.processOrder(
                dto.getOrderId(),
                dto.getOperatorId(),
                dto.getProcessResult(),
                dto.getAfterImages(),
                dto.getRemark()
        );
        return Result.success("处理完成", order);
    }

    @PostMapping("/escalate")
    public Result<WorkOrder> escalateOrder(
            @RequestParam Long orderId,
            @RequestParam Long operatorId,
            @RequestParam(required = false) String remark) {
        WorkOrder order = workOrderService.escalateOrder(orderId, operatorId, remark);
        return Result.success("工单已升级", order);
    }

    @GetMapping("/{id}/logs")
    public Result<List<WorkOrderLog>> getOrderLogs(@PathVariable Long id) {
        return Result.success(workOrderLogService.getOrderLogs(id));
    }

    @PostMapping("/evaluate")
    public Result<WorkOrderEvaluation> evaluateOrder(@Validated @RequestBody WorkOrderEvaluationDTO dto) {
        WorkOrderEvaluation evaluation = evaluationService.evaluate(dto);
        return Result.success("评价成功", evaluation);
    }

    @GetMapping("/{id}/evaluation")
    public Result<WorkOrderEvaluation> getOrderEvaluation(@PathVariable Long id) {
        return Result.success(evaluationService.getByOrderId(id));
    }
}
