package com.recycling.service.impl;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.recycling.dto.CreateOrderDTO;
import com.recycling.entity.AppointmentOrder;
import com.recycling.exception.BusinessException;
import com.recycling.mapper.AppointmentOrderMapper;
import com.recycling.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class OrderServiceImpl extends ServiceImpl<AppointmentOrderMapper, AppointmentOrder> implements OrderService {

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AppointmentOrder createOrder(Long userId, CreateOrderDTO dto) {
        AppointmentOrder order = new AppointmentOrder();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setAddressId(dto.getAddressId());
        order.setCategoryId(dto.getCategoryId());
        order.setQuantity(dto.getQuantity());
        order.setEstimatedPrice(dto.getEstimatedPrice());
        order.setDescription(dto.getDescription());
        order.setImages(dto.getImages() != null ? JSON.toJSONString(dto.getImages()) : null);
        order.setAppointmentTime(dto.getAppointmentTime());
        order.setStatus("PENDING");
        
        save(order);
        return order;
    }

    @Override
    public List<AppointmentOrder> getUserOrders(Long userId, String status) {
        LambdaQueryWrapper<AppointmentOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AppointmentOrder::getUserId, userId)
                .eq(AppointmentOrder::getDeleted, 0);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(AppointmentOrder::getStatus, status);
        }
        wrapper.orderByDesc(AppointmentOrder::getCreateTime);
        return list(wrapper);
    }

    @Override
    public List<AppointmentOrder> getCollectorOrders(Long collectorId, String status) {
        LambdaQueryWrapper<AppointmentOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AppointmentOrder::getCollectorId, collectorId)
                .eq(AppointmentOrder::getDeleted, 0);
        if (status != null && !status.isEmpty()) {
            wrapper.eq(AppointmentOrder::getStatus, status);
        }
        wrapper.orderByDesc(AppointmentOrder::getCreateTime);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AppointmentOrder acceptOrder(Long collectorId, Long orderId) {
        AppointmentOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!"PENDING".equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许接单");
        }
        
        order.setCollectorId(collectorId);
        order.setStatus("ACCEPTED");
        updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AppointmentOrder updateOrderStatus(Long orderId, String status) {
        AppointmentOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        order.setStatus(status);
        updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AppointmentOrder negotiate(Long orderId, BigDecimal finalPrice) {
        AppointmentOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        order.setFinalPrice(finalPrice);
        order.setStatus("NEGOTIATING");
        updateById(order);
        return order;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId, Long userId, String reason) {
        AppointmentOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("无权操作此订单");
        }
        if ("COMPLETED".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            throw new BusinessException("订单状态不允许取消");
        }
        
        order.setStatus("CANCELLED");
        order.setCancelReason(reason);
        updateById(order);
    }

    @Override
    public AppointmentOrder getOrderDetail(Long orderId) {
        return getById(orderId);
    }

    private String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "RE" + dateStr + random;
    }
}
