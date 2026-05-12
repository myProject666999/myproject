package com.onsiterepair.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.onsiterepair.entity.GrabRecord;
import com.onsiterepair.entity.RepairOrder;
import com.onsiterepair.entity.Worker;
import com.onsiterepair.exception.BusinessException;
import com.onsiterepair.mapper.GrabRecordMapper;
import com.onsiterepair.mapper.RepairOrderMapper;
import com.onsiterepair.mapper.WorkerMapper;
import com.onsiterepair.service.NotificationService;
import com.onsiterepair.service.OrderService;
import com.onsiterepair.utils.MapUtils;
import com.onsiterepair.utils.OrderNoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<RepairOrderMapper, RepairOrder> implements OrderService {

    private final OrderNoUtils orderNoUtils;
    private final MapUtils mapUtils;
    private final WorkerMapper workerMapper;
    private final GrabRecordMapper grabRecordMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public RepairOrder createOrder(RepairOrder order) {
        order.setOrderNo(orderNoUtils.generateOrderNo());
        order.setStatus(0);
        order.setGrabStartTime(LocalDateTime.now());
        order.setNegotiationStatus(0);
        order.setPartsAmount(BigDecimal.ZERO);
        order.setLaborAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setWarrantyMonths(3);
        save(order);
        return order;
    }

    @Override
    public List<RepairOrder> getUserOrders(Long userId, Integer status) {
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getUserId, userId)
                .orderByDesc(RepairOrder::getCreateTime);
        if (status != null) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        return list(wrapper);
    }

    @Override
    public List<RepairOrder> getWorkerOrders(Long workerId, Integer status) {
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<RepairOrder>()
                .eq(RepairOrder::getWorkerId, workerId)
                .orderByDesc(RepairOrder::getCreateTime);
        if (status != null) {
            wrapper.eq(RepairOrder::getStatus, status);
        }
        return list(wrapper);
    }

    @Override
    @Transactional
    public RepairOrder grabOrder(Long orderId, Long workerId) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != 0) {
            throw new BusinessException("订单状态不允许抢单");
        }
        
        Worker worker = workerMapper.selectById(workerId);
        if (worker == null) {
            throw new BusinessException("师傅不存在");
        }
        if (worker.getStatus() != 1) {
            throw new BusinessException("师傅账号未通过审核");
        }

        BigDecimal distance = mapUtils.calculateDistance(
                order.getLatitude(), order.getLongitude(),
                worker.getLatitude(), worker.getLongitude()
        );

        GrabRecord record = new GrabRecord();
        record.setOrderId(orderId);
        record.setWorkerId(workerId);
        record.setDistance(distance);
        record.setIsSuccess(1);
        grabRecordMapper.insert(record);

        order.setWorkerId(workerId);
        order.setStatus(1);
        order.setAcceptTime(LocalDateTime.now());
        updateById(order);

        notificationService.createNotification(1, order.getUserId(), "order", 
                "订单已被接单", "您的订单已被师傅接单", order.getId());

        return order;
    }

    @Override
    public RepairOrder updateOrderStatus(Long orderId, Integer status) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setStatus(status);
        
        if (status == 2) {
            order.setStartTime(LocalDateTime.now());
        } else if (status == 5) {
            order.setFinishTime(LocalDateTime.now());
        } else if (status == 6) {
            order.setCancelTime(LocalDateTime.now());
        }
        
        updateById(order);
        return order;
    }

    @Override
    public RepairOrder addPartsList(Long orderId, String partsList, BigDecimal partsAmount, BigDecimal laborAmount) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setPartsList(partsList);
        order.setPartsAmount(partsAmount);
        order.setLaborAmount(laborAmount);
        order.setTotalAmount(partsAmount.add(laborAmount));
        order.setStatus(3);
        updateById(order);
        return order;
    }

    @Override
    public RepairOrder negotiatePrice(Long orderId, Long userId, Integer userType, BigDecimal amount, String note) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setNegotiatedAmount(amount);
        order.setNegotiatedNote(note);
        order.setNegotiationStatus(1);
        updateById(order);
        
        Integer notifyUserType = userType == 1 ? 2 : 1;
        Long notifyUserId = userType == 1 ? order.getWorkerId() : order.getUserId();
        notificationService.createNotification(notifyUserType, notifyUserId, "negotiation",
                "收到议价请求", "有新的议价请求需要处理", order.getId());
        
        return order;
    }

    @Override
    public RepairOrder confirmNegotiation(Long orderId, Long userId, Integer userType) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        
        if (order.getNegotiationStatus() == 1 && userType == 2) {
            order.setNegotiationStatus(2);
        } else if (order.getNegotiationStatus() == 2 && userType == 1) {
            order.setNegotiationStatus(3);
            order.setTotalAmount(order.getNegotiatedAmount());
        }
        
        updateById(order);
        return order;
    }

    @Override
    @Transactional
    public RepairOrder completeOrder(Long orderId, String afterImages, String recordingUrl) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setAfterImages(afterImages);
        order.setRecordingUrl(recordingUrl);
        order.setStatus(4);
        order.setFinishTime(LocalDateTime.now());
        updateById(order);

        notificationService.createNotification(1, order.getUserId(), "order",
                "维修完成待确认", "师傅已完成维修，请确认", order.getId());

        return order;
    }

    @Override
    @Transactional
    public RepairOrder payOrder(Long orderId) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setStatus(5);
        order.setPayTime(LocalDateTime.now());
        order.setPayType("online");
        order.setWarrantyStartTime(LocalDateTime.now());
        order.setWarrantyEndTime(LocalDateTime.now().plusMonths(order.getWarrantyMonths()));
        updateById(order);

        Worker worker = workerMapper.selectById(order.getWorkerId());
        if (worker != null) {
            worker.setOrderCount(worker.getOrderCount() + 1);
            workerMapper.updateById(worker);
        }

        notificationService.createNotification(2, order.getWorkerId(), "order",
                "订单已支付", "用户已支付订单", order.getId());

        return order;
    }

    @Override
    @Transactional
    public RepairOrder cancelOrder(Long orderId, Long userId, Integer userType, String reason) {
        RepairOrder order = getById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() >= 3) {
            throw new BusinessException("当前状态不允许取消订单");
        }
        order.setStatus(6);
        order.setCancelTime(LocalDateTime.now());
        order.setCancelReason(reason);
        updateById(order);

        if (userType == 1 && order.getWorkerId() != null) {
            notificationService.createNotification(2, order.getWorkerId(), "order",
                    "订单已取消", "用户取消了订单", order.getId());
        } else if (userType == 2) {
            notificationService.createNotification(1, order.getUserId(), "order",
                    "订单已取消", "师傅取消了订单", order.getId());
        }

        return order;
    }
}
