package com.smartdoor.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.smartdoor.common.PageResult;
import com.smartdoor.common.Result;
import com.smartdoor.entity.RepairOrder;

public interface RepairOrderService extends IService<RepairOrder> {
    Result<PageResult<RepairOrder>> getOrderPage(int pageNum, int pageSize, String orderNo, Long tenantId,
                                                   Long apartmentId, String repairType, String priority, String status, String keyword);
    Result<RepairOrder> getOrderDetail(Long id);
    Result<Void> createOrder(RepairOrder order);
    Result<Void> assignOrder(Long id, Long assigneeId, String assigneeName);
    Result<Void> startProcess(Long id, String processDescription);
    Result<Void> completeOrder(Long id, String processDescription, java.math.BigDecimal costAmount, String costBearer);
    Result<Void> cancelOrder(Long id, String reason);
    Result<Void> evaluateOrder(Long id, Integer satisfactionScore, String satisfactionComment);
}
