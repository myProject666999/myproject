package com.chess.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.chess.dto.MergeTableDTO;
import com.chess.dto.OrderItemDTO;
import com.chess.dto.OrderRequest;
import com.chess.dto.TransferTableDTO;
import com.chess.entity.*;
import com.chess.mapper.*;
import com.chess.service.OrdersService;
import com.chess.service.TableInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class OrdersServiceImpl extends ServiceImpl<OrdersMapper, Orders> implements OrdersService {

    @Autowired
    private TableInfoService tableInfoService;

    @Autowired
    private TableInfoMapper tableInfoMapper;

    @Autowired
    private TableTypeMapper tableTypeMapper;

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private MemberMapper memberMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Orders openTable(OrderRequest request) {
        TableInfo table = tableInfoService.getById(request.getTableId());
        if (table == null) {
            throw new RuntimeException("桌台不存在");
        }
        if (table.getStatus() != 0) {
            throw new RuntimeException("该桌台当前不可用");
        }

        Orders order = new Orders();
        order.setOrderNo("ORD" + System.currentTimeMillis());
        order.setTableId(request.getTableId());
        order.setMemberId(request.getMemberId());
        order.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now());
        order.setStatus(0);
        order.setRemark(request.getRemark());
        order.setTableFee(BigDecimal.ZERO);
        order.setProductFee(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setPayAmount(BigDecimal.ZERO);
        this.save(order);

        tableInfoService.updateTableStatus(request.getTableId(), 1);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemDTO item : request.getItems()) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrderId(order.getId());
                orderItem.setProductId(item.getProductId());
                orderItem.setProductName(item.getProductName());
                orderItem.setPrice(item.getPrice());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setTotalPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                orderItemMapper.insert(orderItem);

                Product product = productMapper.selectById(item.getProductId());
                if (product != null) {
                    product.setStock(product.getStock() - item.getQuantity());
                    productMapper.updateById(product);
                }
            }
        }

        return order;
    }

    @Override
    public Orders getActiveOrderByTableId(Long tableId) {
        return this.baseMapper.selectActiveOrderByTableId(tableId);
    }

    @Override
    public List<Orders> getActiveOrders() {
        return this.baseMapper.selectActiveOrders();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addProduct(Long orderId, OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return;
        }

        Orders order = this.getById(orderId);
        if (order == null || order.getStatus() != 0) {
            throw new RuntimeException("订单不存在或已结束");
        }

        for (OrderItemDTO item : request.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(orderId);
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setTotalPrice(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            orderItemMapper.insert(orderItem);

            Product product = productMapper.selectById(item.getProductId());
            if (product != null) {
                product.setStock(product.getStock() - item.getQuantity());
                productMapper.updateById(product);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferTable(TransferTableDTO dto) {
        Orders order = this.getById(dto.getOrderId());
        if (order == null || order.getStatus() != 0) {
            throw new RuntimeException("订单不存在或已结束");
        }

        TableInfo fromTable = tableInfoService.getById(dto.getFromTableId());
        TableInfo toTable = tableInfoService.getById(dto.getToTableId());

        if (toTable == null || toTable.getStatus() != 0) {
            throw new RuntimeException("目标桌台不可用");
        }

        order.setTableId(dto.getToTableId());
        this.updateById(order);

        tableInfoService.updateTableStatus(dto.getFromTableId(), 0);
        tableInfoService.updateTableStatus(dto.getToTableId(), 1);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void mergeTable(MergeTableDTO dto) {
        if (dto.getTargetOrderId() == null) {
            throw new RuntimeException("目标订单ID不能为空");
        }
        if (dto.getSourceOrderIds() == null || dto.getSourceOrderIds().isEmpty()) {
            throw new RuntimeException("源订单列表不能为空");
        }

        Orders targetOrder = this.getById(dto.getTargetOrderId());
        if (targetOrder == null || targetOrder.getStatus() != 0) {
            throw new RuntimeException("目标订单不存在或已结束");
        }

        for (Long sourceOrderId : dto.getSourceOrderIds()) {
            if (sourceOrderId == null) {
                continue;
            }
            if (sourceOrderId.equals(dto.getTargetOrderId())) {
                throw new RuntimeException("源订单不能与目标订单相同");
            }

            Orders sourceOrder = this.getById(sourceOrderId);
            if (sourceOrder == null || sourceOrder.getStatus() != 0) {
                throw new RuntimeException("源订单不存在或已结束");
            }

            List<OrderItem> items = orderItemMapper.selectByOrderId(sourceOrderId);
            if (items != null && !items.isEmpty()) {
                for (OrderItem item : items) {
                    item.setId(null);
                    item.setOrderId(targetOrder.getId());
                    orderItemMapper.insert(item);
                }
            }

            if (sourceOrder.getTableId() != null) {
                TableInfo sourceTable = tableInfoService.getById(sourceOrder.getTableId());
                if (sourceTable != null) {
                    tableInfoService.updateTableStatus(sourceTable.getId(), 0);
                }
            }

            sourceOrder.setStatus(2);
            this.updateById(sourceOrder);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Orders checkout(Long orderId, String paymentMethod, Long memberId) {
        Orders order = this.getById(orderId);
        if (order == null || order.getStatus() != 0) {
            throw new RuntimeException("订单不存在或已结束");
        }

        LocalDateTime startTime = order.getStartTime();
        if (startTime == null) {
            startTime = LocalDateTime.now();
        }

        LocalDateTime endTime = LocalDateTime.now();
        order.setEndTime(endTime);
        order.setPaymentMethod(paymentMethod);

        BigDecimal tableFee = calculateTableFee(order.getTableId(), startTime, endTime);
        order.setTableFee(tableFee);

        List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
        BigDecimal productFee = BigDecimal.ZERO;
        if (items != null) {
            for (OrderItem item : items) {
                if (item.getTotalPrice() != null) {
                    productFee = productFee.add(item.getTotalPrice());
                }
            }
        }
        order.setProductFee(productFee);

        BigDecimal totalAmount = tableFee.add(productFee);
        order.setTotalAmount(totalAmount);

        BigDecimal discountRate = BigDecimal.ONE;
        Member member = null;
        if (memberId != null) {
            member = memberMapper.selectById(memberId);
            if (member != null && member.getStatus() != null && member.getStatus() == 1) {
                discountRate = member.getDiscountRate() != null ? member.getDiscountRate() : BigDecimal.ONE;
                order.setMemberId(memberId);
            }
        }

        BigDecimal discountAmount = totalAmount.multiply(BigDecimal.ONE.subtract(discountRate));
        order.setDiscountAmount(discountAmount);

        BigDecimal payAmount = totalAmount.subtract(discountAmount);
        order.setPayAmount(payAmount);

        long minutes = ChronoUnit.MINUTES.between(startTime, endTime);
        if (minutes < 0) minutes = 0;
        order.setHours(BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP));

        order.setStatus(1);
        this.updateById(order);

        if (order.getTableId() != null) {
            tableInfoService.updateTableStatus(order.getTableId(), 0);
        }

        if (member != null && payAmount != null) {
            int points = payAmount.intValue();
            Integer currentPoints = member.getPoints() != null ? member.getPoints() : 0;
            member.setPoints(currentPoints + points);
            memberMapper.updateById(member);
        }

        return order;
    }

    @Override
    public Orders getOrderDetail(Long orderId) {
        Orders order = this.baseMapper.selectByIdWithDetail(orderId);
        if (order != null) {
            order.setOrderItems(orderItemMapper.selectByOrderId(orderId));
        }
        return order;
    }

    @Override
    public BigDecimal calculateTableFee(Long tableId, LocalDateTime startTime, LocalDateTime endTime) {
        TableInfo table = tableInfoMapper.selectById(tableId);
        if (table == null) {
            return BigDecimal.ZERO;
        }

        TableType type = tableTypeMapper.selectById(table.getTypeId());
        if (type == null) {
            return BigDecimal.ZERO;
        }

        long minutes = ChronoUnit.MINUTES.between(startTime, endTime);
        if (minutes < 0) {
            minutes = 0;
        }

        BigDecimal hours = BigDecimal.valueOf(minutes).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        return type.getHourlyRate().multiply(hours).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public List<Map<String, Object>> getDailyReport(LocalDateTime startTime, LocalDateTime endTime) {
        return this.baseMapper.selectDailyReport(startTime, endTime);
    }

    @Override
    public Map<String, Object> getSummaryReport(LocalDateTime startTime, LocalDateTime endTime) {
        return this.baseMapper.selectSummaryReport(startTime, endTime);
    }
}
