package com.db.schema.review.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.db.schema.review.common.Result;
import com.db.schema.review.entity.RiskDetection;
import com.db.schema.review.entity.SchemaOrder;
import com.db.schema.review.entity.SchemaOrderSql;
import com.db.schema.review.service.RiskDetectionService;
import com.db.schema.review.service.SchemaOrderService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/order")
@CrossOrigin
public class SchemaOrderController {

    @Autowired
    private SchemaOrderService orderService;

    @Autowired
    private RiskDetectionService riskDetectionService;

    @PostMapping("/create")
    public Result<SchemaOrder> createOrder(@RequestBody CreateOrderRequest request) {
        SchemaOrder order = new SchemaOrder();
        order.setTitle(request.getTitle());
        order.setDescription(request.getDescription());
        order.setEnvId(request.getEnvId());
        order.setDbName(request.getDbName());
        order.setPriority(request.getPriority());
        order.setChangeType(request.getChangeType());
        order.setIsGray(request.getIsGray());
        order.setRollbackSql(request.getRollbackSql());
        order.setPlanExecuteTime(request.getPlanExecuteTime());
        order.setBatchCount(request.getBatchCount() != null ? request.getBatchCount() : 1);

        SchemaOrder result = orderService.createOrder(order, request.getSqlList());
        return Result.success(result);
    }

    @PostMapping("/submit/{orderId}")
    public Result<Void> submitForReview(@PathVariable Long orderId) {
        orderService.submitForReview(orderId);
        return Result.success();
    }

    @PostMapping("/update")
    public Result<Void> updateOrder(@RequestBody UpdateOrderRequest request) {
        SchemaOrder order = new SchemaOrder();
        order.setId(request.getId());
        order.setTitle(request.getTitle());
        order.setDescription(request.getDescription());
        order.setEnvId(request.getEnvId());
        order.setDbName(request.getDbName());
        order.setPriority(request.getPriority());
        order.setChangeType(request.getChangeType());
        order.setIsGray(request.getIsGray());
        order.setRollbackSql(request.getRollbackSql());
        order.setPlanExecuteTime(request.getPlanExecuteTime());

        orderService.updateOrder(order, request.getSqlList());
        return Result.success();
    }

    @GetMapping("/list")
    public Result<Page<SchemaOrder>> getOrderList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String applicantId) {
        Page<SchemaOrder> page = orderService.getOrderPage(pageNum, pageSize, status, applicantId);
        return Result.success(page);
    }

    @GetMapping("/{orderId}")
    public Result<SchemaOrder> getOrderDetail(@PathVariable Long orderId) {
        SchemaOrder order = orderService.getOrderDetail(orderId);
        return Result.success(order);
    }

    @GetMapping("/{orderId}/sql")
    public Result<List<SchemaOrderSql>> getOrderSqlList(@PathVariable Long orderId) {
        List<SchemaOrderSql> list = orderService.getOrderSqlList(orderId);
        return Result.success(list);
    }

    @GetMapping("/{orderId}/risks")
    public Result<List<RiskDetection>> getOrderRisks(@PathVariable Long orderId) {
        List<RiskDetection> risks = riskDetectionService.getRisksByOrderId(orderId);
        return Result.success(risks);
    }

    @PostMapping("/cancel/{orderId}")
    public Result<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return Result.success();
    }

    @Data
    public static class CreateOrderRequest {
        private String title;
        private String description;
        private Long envId;
        private String dbName;
        private String priority;
        private String changeType;
        private Integer isGray;
        private String rollbackSql;
        private LocalDateTime planExecuteTime;
        private Integer batchCount;
        private List<String> sqlList;
    }

    @Data
    public static class UpdateOrderRequest {
        private Long id;
        private String title;
        private String description;
        private Long envId;
        private String dbName;
        private String priority;
        private String changeType;
        private Integer isGray;
        private String rollbackSql;
        private LocalDateTime planExecuteTime;
        private List<String> sqlList;
    }
}
