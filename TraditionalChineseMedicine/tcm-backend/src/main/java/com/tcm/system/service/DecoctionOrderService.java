package com.tcm.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.tcm.system.entity.DecoctionOrder;
import com.tcm.system.repository.DecoctionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DecoctionOrderService {

    @Autowired
    private DecoctionOrderRepository decoctionOrderRepository;

    public List<DecoctionOrder> list(Integer status) {
        LambdaQueryWrapper<DecoctionOrder> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(DecoctionOrder::getStatus, status);
        }
        wrapper.orderByDesc(DecoctionOrder::getCreateTime);
        return decoctionOrderRepository.selectList(wrapper);
    }

    public DecoctionOrder getById(Long id) {
        return decoctionOrderRepository.selectById(id);
    }

    public DecoctionOrder getByPrescriptionId(Long prescriptionId) {
        LambdaQueryWrapper<DecoctionOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DecoctionOrder::getPrescriptionId, prescriptionId);
        return decoctionOrderRepository.selectOne(wrapper);
    }

    public boolean create(DecoctionOrder order) {
        if (order.getOrderNo() == null || order.getOrderNo().isEmpty()) {
            String no = "DJ" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            order.setOrderNo(no);
        }
        if (order.getStatus() == null) {
            order.setStatus(1);
        }
        return decoctionOrderRepository.insert(order) > 0;
    }

    public boolean update(DecoctionOrder order) {
        return decoctionOrderRepository.updateById(order) > 0;
    }

    public boolean start(Long id) {
        DecoctionOrder order = new DecoctionOrder();
        order.setId(id);
        order.setStatus(2);
        order.setStartTime(LocalDateTime.now());
        return decoctionOrderRepository.updateById(order) > 0;
    }

    public boolean complete(Long id) {
        DecoctionOrder order = new DecoctionOrder();
        order.setId(id);
        order.setStatus(3);
        order.setCompleteTime(LocalDateTime.now());
        return decoctionOrderRepository.updateById(order) > 0;
    }

    public boolean pickup(Long id) {
        DecoctionOrder order = new DecoctionOrder();
        order.setId(id);
        order.setStatus(4);
        return decoctionOrderRepository.updateById(order) > 0;
    }

    public boolean delete(Long id) {
        return decoctionOrderRepository.deleteById(id) > 0;
    }
}
