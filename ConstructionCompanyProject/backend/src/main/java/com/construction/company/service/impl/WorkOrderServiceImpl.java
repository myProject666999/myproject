package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.WorkOrder;
import com.construction.company.mapper.WorkOrderMapper;
import com.construction.company.service.WorkOrderService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkOrderServiceImpl extends ServiceImpl<WorkOrderMapper, WorkOrder> implements WorkOrderService {

    @Override
    public boolean save(WorkOrder workOrder) {
        return super.save(workOrder);
    }

    @Override
    public boolean updateById(WorkOrder workOrder) {
        return super.updateById(workOrder);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public WorkOrder getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<WorkOrder> list() {
        return super.list();
    }
}
