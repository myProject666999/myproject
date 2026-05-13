package com.chess.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.chess.dto.MergeTableDTO;
import com.chess.dto.OrderRequest;
import com.chess.dto.TransferTableDTO;
import com.chess.entity.Orders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrdersService extends IService<Orders> {
    Orders openTable(OrderRequest request);
    Orders getActiveOrderByTableId(Long tableId);
    List<Orders> getActiveOrders();
    void addProduct(Long orderId, OrderRequest request);
    void transferTable(TransferTableDTO dto);
    void mergeTable(MergeTableDTO dto);
    Orders checkout(Long orderId, String paymentMethod, Long memberId);
    Orders getOrderDetail(Long orderId);
    BigDecimal calculateTableFee(Long tableId, LocalDateTime startTime, LocalDateTime endTime);
    List<Map<String, Object>> getDailyReport(LocalDateTime startTime, LocalDateTime endTime);
    Map<String, Object> getSummaryReport(LocalDateTime startTime, LocalDateTime endTime);
}
