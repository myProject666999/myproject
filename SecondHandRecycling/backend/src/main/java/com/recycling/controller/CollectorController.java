package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.entity.AppointmentOrder;
import com.recycling.security.UserPrincipal;
import com.recycling.service.OrderService;
import com.recycling.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/collector")
public class CollectorController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private WalletService walletService;

    @GetMapping("/orders")
    public Result<List<AppointmentOrder>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal,
                                                      @RequestParam(required = false) String status) {
        return Result.success(orderService.getCollectorOrders(principal.getUserId(), status));
    }

    @PostMapping("/order/accept/{orderId}")
    public Result<AppointmentOrder> acceptOrder(@AuthenticationPrincipal UserPrincipal principal,
                                                @PathVariable Long orderId) {
        return Result.success(orderService.acceptOrder(principal.getUserId(), orderId));
    }

    @PostMapping("/order/status/{orderId}")
    public Result<AppointmentOrder> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestParam String status) {
        return Result.success(orderService.updateOrderStatus(orderId, status));
    }

    @PostMapping("/order/negotiate/{orderId}")
    public Result<AppointmentOrder> negotiate(@PathVariable Long orderId,
                                              @RequestParam BigDecimal finalPrice) {
        return Result.success(orderService.negotiate(orderId, finalPrice));
    }

    @PostMapping("/order/complete/{orderId}")
    public Result<Void> completeOrder(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long orderId,
                                      @RequestParam BigDecimal finalPrice) {
        AppointmentOrder order = orderService.negotiate(orderId, finalPrice);
        orderService.updateOrderStatus(orderId, "COMPLETED");
        walletService.addIncome(order.getUserId(), finalPrice, orderId, "回收订单结算");
        return Result.success();
    }
}
