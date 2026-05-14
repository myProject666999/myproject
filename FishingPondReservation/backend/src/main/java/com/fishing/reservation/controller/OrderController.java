package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.Equipment;
import com.fishing.reservation.entity.EquipmentOrder;
import com.fishing.reservation.entity.EquipmentOrderItem;
import com.fishing.reservation.mapper.EquipmentMapper;
import com.fishing.reservation.mapper.EquipmentOrderItemMapper;
import com.fishing.reservation.mapper.EquipmentOrderMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private EquipmentOrderMapper orderMapper;

    @Autowired
    private EquipmentOrderItemMapper orderItemMapper;

    @Autowired
    private EquipmentMapper equipmentMapper;

    @GetMapping("/list")
    public Result<List<EquipmentOrder>> list(@RequestParam(required = false) Long userId) {
        LambdaQueryWrapper<EquipmentOrder> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(EquipmentOrder::getUserId, userId);
        }
        wrapper.orderByDesc(EquipmentOrder::getCreateTime);
        List<EquipmentOrder> list = orderMapper.selectList(wrapper);
        return Result.success(list);
    }

    @PostMapping
    @Transactional
    public Result<EquipmentOrder> create(@RequestBody Map<String, Object> orderData) {
        Long userId = ((Number) orderData.get("userId")).longValue();
        String paymentType = (String) orderData.get("paymentType");
        List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");

        if (items == null || items.isEmpty()) {
            return Result.error("订单商品不能为空");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Map<String, Object> item : items) {
            Long equipmentId = ((Number) item.get("equipmentId")).longValue();
            Integer quantity = ((Number) item.get("quantity")).intValue();

            Equipment equipment = equipmentMapper.selectById(equipmentId);
            if (equipment == null) {
                return Result.error("商品不存在");
            }
            if (equipment.getStock() < quantity) {
                return Result.error("商品库存不足：" + equipment.getName());
            }

            totalAmount = totalAmount.add(equipment.getPrice().multiply(new BigDecimal(quantity)));
        }

        String orderNo = generateOrderNo();

        EquipmentOrder order = new EquipmentOrder();
        order.setUserId(userId);
        order.setOrderNo(orderNo);
        order.setTotalAmount(totalAmount);
        order.setPaymentType(paymentType);
        order.setStatus(1);
        orderMapper.insert(order);

        for (Map<String, Object> item : items) {
            Long equipmentId = ((Number) item.get("equipmentId")).longValue();
            Integer quantity = ((Number) item.get("quantity")).intValue();

            Equipment equipment = equipmentMapper.selectById(equipmentId);

            EquipmentOrderItem orderItem = new EquipmentOrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setEquipmentId(equipmentId);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(equipment.getPrice());
            orderItem.setTotalPrice(equipment.getPrice().multiply(new BigDecimal(quantity)));
            orderItemMapper.insert(orderItem);

            equipment.setStock(equipment.getStock() - quantity);
            equipmentMapper.updateById(equipment);
        }

        return Result.success("下单成功", order);
    }

    @GetMapping("/{id}/items")
    public Result<List<EquipmentOrderItem>> items(@PathVariable Long id) {
        List<EquipmentOrderItem> items = orderItemMapper.selectList(
            new LambdaQueryWrapper<EquipmentOrderItem>().eq(EquipmentOrderItem::getOrderId, id)
        );
        return Result.success(items);
    }

    private String generateOrderNo() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "EQ" + date + random;
    }
}
