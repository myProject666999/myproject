package com.smartdoor.controller;

import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.RepairOrder;
import com.smartdoor.service.RepairOrderService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Api(tags = "报修工单管理")
@RestController
@RequestMapping("/repair-order")
public class RepairOrderController {

    @Autowired
    private RepairOrderService repairOrderService;

    @ApiOperation("分页查询工单列表")
    @GetMapping("/page")
    public Result<PageResult<RepairOrder>> getOrderPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) Long tenantId,
            @RequestParam(required = false) Long apartmentId,
            @RequestParam(required = false) String repairType,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return repairOrderService.getOrderPage(pageNum, pageSize, orderNo, tenantId, apartmentId, repairType, priority, status, keyword);
    }

    @ApiOperation("获取工单详情")
    @GetMapping("/{id}")
    public Result<RepairOrder> getOrderDetail(@PathVariable Long id) {
        return repairOrderService.getOrderDetail(id);
    }

    @ApiOperation("创建报修工单")
    @PostMapping
    public Result<Void> createOrder(@RequestBody RepairOrder order) {
        return repairOrderService.createOrder(order);
    }

    @ApiOperation("分配工单")
    @PutMapping("/{id}/assign")
    public Result<Void> assignOrder(
            @PathVariable Long id,
            @RequestParam Long assigneeId,
            @RequestParam String assigneeName) {
        return repairOrderService.assignOrder(id, assigneeId, assigneeName);
    }

    @ApiOperation("开始处理工单")
    @PutMapping("/{id}/start-process")
    public Result<Void> startProcess(
            @PathVariable Long id,
            @RequestParam String processDescription) {
        return repairOrderService.startProcess(id, processDescription);
    }

    @ApiOperation("完成工单")
    @PutMapping("/{id}/complete")
    public Result<Void> completeOrder(
            @PathVariable Long id,
            @RequestParam String processDescription,
            @RequestParam(required = false) BigDecimal costAmount,
            @RequestParam(required = false) String costBearer) {
        return repairOrderService.completeOrder(id, processDescription, costAmount, costBearer);
    }

    @ApiOperation("取消工单")
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelOrder(
            @PathVariable Long id,
            @RequestParam String reason) {
        return repairOrderService.cancelOrder(id, reason);
    }

    @ApiOperation("评价工单")
    @PutMapping("/{id}/evaluate")
    public Result<Void> evaluateOrder(
            @PathVariable Long id,
            @RequestParam Integer satisfactionScore,
            @RequestParam(required = false) String satisfactionComment) {
        return repairOrderService.evaluateOrder(id, satisfactionScore, satisfactionComment);
    }
}
