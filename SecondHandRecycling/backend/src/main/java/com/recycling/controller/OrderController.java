package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.dto.CreateOrderDTO;
import com.recycling.entity.AppointmentOrder;
import com.recycling.security.UserPrincipal;
import com.recycling.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public Result<AppointmentOrder> createOrder(@AuthenticationPrincipal UserPrincipal principal,
                                                @Valid @RequestBody CreateOrderDTO dto) {
        return Result.success(orderService.createOrder(principal.getUserId(), dto));
    }

    @GetMapping("/list")
    public Result<List<AppointmentOrder>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal,
                                                        @RequestParam(required = false) String status) {
        return Result.success(orderService.getUserOrders(principal.getUserId(), status));
    }

    @GetMapping("/{id}")
    public Result<AppointmentOrder> getOrderDetail(@PathVariable Long id) {
        return Result.success(orderService.getOrderDetail(id));
    }

    @PostMapping("/cancel/{id}")
    public Result<Void> cancelOrder(@AuthenticationPrincipal UserPrincipal principal,
                                    @PathVariable Long id,
                                    @RequestParam(required = false) String reason) {
        orderService.cancelOrder(id, principal.getUserId(), reason);
        return Result.success();
    }
}
