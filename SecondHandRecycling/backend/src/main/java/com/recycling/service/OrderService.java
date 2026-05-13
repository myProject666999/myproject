package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.dto.CreateOrderDTO;
import com.recycling.entity.AppointmentOrder;

import java.util.List;

public interface OrderService extends IService<AppointmentOrder> {
    AppointmentOrder createOrder(Long userId, CreateOrderDTO dto);
    List<AppointmentOrder> getUserOrders(Long userId, String status);
    List<AppointmentOrder> getCollectorOrders(Long collectorId, String status);
    AppointmentOrder acceptOrder(Long collectorId, Long orderId);
    AppointmentOrder updateOrderStatus(Long orderId, String status);
    AppointmentOrder negotiate(Long orderId, java.math.BigDecimal finalPrice);
    void cancelOrder(Long orderId, Long userId, String reason);
    AppointmentOrder getOrderDetail(Long orderId);
}
