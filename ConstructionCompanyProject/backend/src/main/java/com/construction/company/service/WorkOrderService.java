package com.construction.company.service;

import com.construction.company.entity.WorkOrder;

import java.util.List;

public interface WorkOrderService {
    boolean save(WorkOrder workOrder);
    boolean updateById(WorkOrder workOrder);
    boolean removeById(Long id);
    WorkOrder getById(Long id);
    List<WorkOrder> list();
}
