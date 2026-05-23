package com.restaurant.controller;

import com.restaurant.dto.OrderRequest;
import com.restaurant.dto.OrderVO;
import com.restaurant.dto.Result;
import com.restaurant.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public Result<OrderVO> createOrder(@RequestBody OrderRequest request, HttpServletRequest httpRequest) {
        String sessionId = httpRequest.getSession().getId();
        return Result.success(orderService.createOrder(request, sessionId));
    }
    
    @GetMapping("/{id}")
    public Result<OrderVO> getOrderById(@PathVariable Long id) {
        return Result.success(orderService.getOrderById(id));
    }
    
    @GetMapping("/no/{orderNo}")
    public Result<OrderVO> getOrderByOrderNo(@PathVariable String orderNo) {
        return Result.success(orderService.getOrderByOrderNo(orderNo));
    }
    
    @GetMapping("/table/{tableId}")
    public Result<List<OrderVO>> getOrdersByTable(@PathVariable Long tableId) {
        return Result.success(orderService.getOrdersByTable(tableId));
    }
    
    @GetMapping("/active")
    public Result<List<OrderVO>> getActiveOrders() {
        return Result.success(orderService.getActiveOrders());
    }
    
    @GetMapping("/status")
    public Result<List<OrderVO>> getOrdersByStatus(@RequestParam List<String> statuses) {
        return Result.success(orderService.getOrdersByStatus(statuses));
    }
    
    @PutMapping("/{id}/confirm")
    public Result<Void> confirmOrder(@PathVariable Long id) {
        orderService.confirmOrder(id);
        return Result.success();
    }
    
    @PutMapping("/item/{itemId}/cook")
    public Result<Void> startCooking(@PathVariable Long itemId) {
        orderService.startCooking(itemId);
        return Result.success();
    }
    
    @PutMapping("/item/{itemId}/serve")
    public Result<Void> serveDish(@PathVariable Long itemId) {
        orderService.serveDish(itemId);
        return Result.success();
    }
    
    @PutMapping("/{id}/complete")
    public Result<Void> completeOrder(@PathVariable Long id) {
        orderService.completeOrder(id);
        return Result.success();
    }
    
    @PutMapping("/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return Result.success();
    }
    
    @PutMapping("/{id}/pay")
    public Result<Void> payOrder(@PathVariable Long id) {
        orderService.payOrder(id);
        return Result.success();
    }
}
