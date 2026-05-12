package com.onsiterepair.controller;

import com.onsiterepair.common.Result;
import com.onsiterepair.entity.RepairOrder;
import com.onsiterepair.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    public Result<RepairOrder> createOrder(@RequestBody RepairOrder order, @RequestAttribute("userId") Long userId) {
        order.setUserId(userId);
        return Result.success(orderService.createOrder(order));
    }

    @GetMapping("/user/list")
    public Result<List<RepairOrder>> getUserOrders(
            @RequestAttribute("userId") Long userId,
            @RequestParam(required = false) Integer status) {
        return Result.success(orderService.getUserOrders(userId, status));
    }

    @GetMapping("/worker/list")
    public Result<List<RepairOrder>> getWorkerOrders(
            @RequestAttribute("userId") Long workerId,
            @RequestParam(required = false) Integer status) {
        return Result.success(orderService.getWorkerOrders(workerId, status));
    }

    @GetMapping("/{id}")
    public Result<RepairOrder> getOrderDetail(@PathVariable Long id) {
        return Result.success(orderService.getById(id));
    }

    @PostMapping("/grab/{orderId}")
    public Result<RepairOrder> grabOrder(@PathVariable Long orderId, @RequestAttribute("userId") Long workerId) {
        return Result.success(orderService.grabOrder(orderId, workerId));
    }

    @PostMapping("/parts/{orderId}")
    public Result<RepairOrder> addPartsList(
            @PathVariable Long orderId,
            @RequestParam String partsList,
            @RequestParam BigDecimal partsAmount,
            @RequestParam BigDecimal laborAmount) {
        return Result.success(orderService.addPartsList(orderId, partsList, partsAmount, laborAmount));
    }

    @PostMapping("/negotiate/{orderId}")
    public Result<RepairOrder> negotiatePrice(
            @PathVariable Long orderId,
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userType") Integer userType,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) String note) {
        return Result.success(orderService.negotiatePrice(orderId, userId, userType, amount, note));
    }

    @PostMapping("/negotiate/confirm/{orderId}")
    public Result<RepairOrder> confirmNegotiation(
            @PathVariable Long orderId,
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userType") Integer userType) {
        return Result.success(orderService.confirmNegotiation(orderId, userId, userType));
    }

    @PostMapping("/complete/{orderId}")
    public Result<RepairOrder> completeOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String afterImages,
            @RequestParam(required = false) String recordingUrl) {
        return Result.success(orderService.completeOrder(orderId, afterImages, recordingUrl));
    }

    @PostMapping("/pay/{orderId}")
    public Result<RepairOrder> payOrder(@PathVariable Long orderId) {
        return Result.success(orderService.payOrder(orderId));
    }

    @PostMapping("/cancel/{orderId}")
    public Result<RepairOrder> cancelOrder(
            @PathVariable Long orderId,
            @RequestAttribute("userId") Long userId,
            @RequestAttribute("userType") Integer userType,
            @RequestParam String reason) {
        return Result.success(orderService.cancelOrder(orderId, userId, userType, reason));
    }
}
