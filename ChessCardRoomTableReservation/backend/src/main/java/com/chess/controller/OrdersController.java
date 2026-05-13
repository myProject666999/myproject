package com.chess.controller;

import com.chess.common.Result;
import com.chess.dto.MergeTableDTO;
import com.chess.dto.OrderRequest;
import com.chess.dto.TransferTableDTO;
import com.chess.entity.Orders;
import com.chess.service.OrdersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrdersController {

    @Autowired
    private OrdersService ordersService;

    @PostMapping("/open")
    public Result<Orders> openTable(@RequestBody OrderRequest request) {
        try {
            return Result.success(ordersService.openTable(request));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/table/{tableId}")
    public Result<Orders> getActiveOrderByTableId(@PathVariable Long tableId) {
        return Result.success(ordersService.getActiveOrderByTableId(tableId));
    }

    @GetMapping("/active")
    public Result<List<Orders>> getActiveOrders() {
        return Result.success(ordersService.getActiveOrders());
    }

    @GetMapping("/{orderId}")
    public Result<Orders> getOrderDetail(@PathVariable Long orderId) {
        return Result.success(ordersService.getOrderDetail(orderId));
    }

    @PostMapping("/{orderId}/products")
    public Result<Boolean> addProduct(@PathVariable Long orderId, @RequestBody OrderRequest request) {
        try {
            ordersService.addProduct(orderId, request);
            return Result.success(true);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/transfer")
    public Result<Boolean> transferTable(@RequestBody TransferTableDTO dto) {
        try {
            ordersService.transferTable(dto);
            return Result.success(true);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/merge")
    public Result<Boolean> mergeTable(@RequestBody MergeTableDTO dto) {
        try {
            ordersService.mergeTable(dto);
            return Result.success(true);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/{orderId}/checkout")
    public Result<Orders> checkout(@PathVariable Long orderId,
                                    @RequestParam(required = false) String paymentMethod,
                                    @RequestParam(required = false) Long memberId) {
        try {
            return Result.success(ordersService.checkout(orderId, paymentMethod, memberId));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/calculate-fee")
    public Result<BigDecimal> calculateFee(@RequestParam Long tableId,
                                            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
                                            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(ordersService.calculateTableFee(tableId, startTime, endTime));
    }

    @GetMapping("/report/daily")
    public Result<List<Map<String, Object>>> getDailyReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(ordersService.getDailyReport(startTime, endTime));
    }

    @GetMapping("/report/summary")
    public Result<Map<String, Object>> getSummaryReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(ordersService.getSummaryReport(startTime, endTime));
    }
}
