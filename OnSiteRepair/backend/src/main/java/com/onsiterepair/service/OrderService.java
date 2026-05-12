package com.onsiterepair.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.onsiterepair.entity.RepairOrder;

import java.util.List;

public interface OrderService extends IService<RepairOrder> {
    RepairOrder createOrder(RepairOrder order);
    List<RepairOrder> getUserOrders(Long userId, Integer status);
    List<RepairOrder> getWorkerOrders(Long workerId, Integer status);
    RepairOrder grabOrder(Long orderId, Long workerId);
    RepairOrder updateOrderStatus(Long orderId, Integer status);
    RepairOrder addPartsList(Long orderId, String partsList, java.math.BigDecimal partsAmount, java.math.BigDecimal laborAmount);
    RepairOrder negotiatePrice(Long orderId, Long userId, Integer userType, java.math.BigDecimal amount, String note);
    RepairOrder confirmNegotiation(Long orderId, Long userId, Integer userType);
    RepairOrder completeOrder(Long orderId, String afterImages, String recordingUrl);
    RepairOrder payOrder(Long orderId);
    RepairOrder cancelOrder(Long orderId, Long userId, Integer userType, String reason);
}
