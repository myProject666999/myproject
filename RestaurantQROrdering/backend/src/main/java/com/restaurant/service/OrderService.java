package com.restaurant.service;

import com.restaurant.dto.OrderRequest;
import com.restaurant.dto.OrderVO;
import com.restaurant.entity.Order;
import java.util.List;

public interface OrderService {
    OrderVO createOrder(OrderRequest request, String sessionId);
    OrderVO getOrderById(Long id);
    OrderVO getOrderByOrderNo(String orderNo);
    List<OrderVO> getOrdersByTable(Long tableId);
    List<OrderVO> getActiveOrders();
    List<OrderVO> getOrdersByStatus(List<String> statuses);
    void confirmOrder(Long id);
    void startCooking(Long itemId);
    void serveDish(Long itemId);
    void completeOrder(Long id);
    void cancelOrder(Long id);
    void payOrder(Long id);
}
