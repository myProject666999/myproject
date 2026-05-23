package com.restaurant.service.impl;

import com.restaurant.dto.OrderRequest;
import com.restaurant.dto.OrderVO;
import com.restaurant.entity.*;
import com.restaurant.repository.*;
import com.restaurant.service.CartService;
import com.restaurant.service.OrderService;
import com.restaurant.websocket.OrderWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DishRepository dishRepository;
    private final TableRepository tableRepository;
    private final CartService cartService;
    private final OrderWebSocketHandler webSocketHandler;
    
    private static final AtomicLong ORDER_COUNTER = new AtomicLong(0);
    
    @Override
    @Transactional
    public OrderVO createOrder(OrderRequest request, String sessionId) {
        DiningTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> new RuntimeException("桌台不存在"));
        
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Dish dish = dishRepository.findById(itemRequest.getDishId())
                    .orElseThrow(() -> new RuntimeException("菜品不存在"));
            
            if (dish.getStatus() != 1) {
                throw new RuntimeException("菜品" + dish.getName() + "已下架");
            }
            
            if (dish.getStock() < itemRequest.getQuantity()) {
                throw new RuntimeException("菜品" + dish.getName() + "库存不足");
            }
            
            int updated = dishRepository.decreaseStock(dish.getId(), itemRequest.getQuantity());
            if (updated == 0) {
                throw new RuntimeException("菜品" + dish.getName() + "库存不足,请刷新重试");
            }
            
            OrderItem orderItem = new OrderItem();
            orderItem.setDishId(dish.getId());
            orderItem.setDishName(dish.getName());
            orderItem.setDishPrice(dish.getPrice());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setSubtotal(dish.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            orderItem.setImage(dish.getImage());
            orderItems.add(orderItem);
            
            totalAmount = totalAmount.add(orderItem.getSubtotal());
        }
        
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setTableId(request.getTableId());
        order.setTotalAmount(totalAmount);
        order.setPayAmount(totalAmount);
        order.setRemark(request.getRemark());
        order.setOrderStatus("PENDING");
        order.setPayStatus("UNPAID");
        
        order = orderRepository.save(order);
        
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(orderItems);
        
        if ("IDLE".equals(table.getStatus())) {
            table.setStatus("OCCUPIED");
            tableRepository.save(table);
        }
        
        cartService.clearCart(sessionId);
        
        order.setItems(orderItems);
        order.setTableNo(table.getTableNo());
        
        webSocketHandler.broadcastNewOrder(convertToVO(order));
        
        log.info("订单创建成功: {}", order.getOrderNo());
        return convertToVO(order);
    }
    
    @Override
    public OrderVO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        return loadOrderDetails(order);
    }
    
    @Override
    public OrderVO getOrderByOrderNo(String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        return loadOrderDetails(order);
    }
    
    @Override
    public List<OrderVO> getOrdersByTable(Long tableId) {
        List<Order> orders = orderRepository.findByTableIdOrderByCreateTimeDesc(tableId);
        return orders.stream().map(this::loadOrderDetails).collect(Collectors.toList());
    }
    
    @Override
    public List<OrderVO> getActiveOrders() {
        List<Order> orders = orderRepository.findActiveOrders();
        return orders.stream().map(this::loadOrderDetails).collect(Collectors.toList());
    }
    
    @Override
    public List<OrderVO> getOrdersByStatus(List<String> statuses) {
        List<Order> orders = orderRepository.findByOrderStatusIn(statuses);
        return orders.stream().map(this::loadOrderDetails).collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        if (!"PENDING".equals(order.getOrderStatus())) {
            throw new RuntimeException("订单状态不正确");
        }
        
        order.setOrderStatus("CONFIRMED");
        order.setUpdateTime(LocalDateTime.now());
        orderRepository.save(order);
        
        webSocketHandler.broadcastOrderUpdate(convertToVO(order));
    }
    
    @Override
    @Transactional
    public void startCooking(Long itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("订单项不存在"));
        
        if (!"PENDING".equals(item.getDishStatus())) {
            throw new RuntimeException("菜品状态不正确");
        }
        
        item.setDishStatus("COOKING");
        orderItemRepository.save(item);
        
        Order order = orderRepository.findById(item.getOrderId()).orElse(null);
        if (order != null) {
            order.setOrderStatus("COOKING");
            order.setUpdateTime(LocalDateTime.now());
            orderRepository.save(order);
            webSocketHandler.broadcastOrderUpdate(loadOrderDetails(order));
        }
    }
    
    @Override
    @Transactional
    public void serveDish(Long itemId) {
        OrderItem item = orderItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("订单项不存在"));
        
        item.setDishStatus("SERVED");
        orderItemRepository.save(item);
        
        dishRepository.increaseSales(item.getDishId(), item.getQuantity());
        
        Order order = orderRepository.findById(item.getOrderId()).orElse(null);
        if (order != null) {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            boolean allServed = items.stream().allMatch(i -> "SERVED".equals(i.getDishStatus()));
            if (allServed) {
                order.setOrderStatus("SERVED");
                order.setUpdateTime(LocalDateTime.now());
                orderRepository.save(order);
            }
            webSocketHandler.broadcastOrderUpdate(loadOrderDetails(order));
        }
    }
    
    @Override
    @Transactional
    public void completeOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        order.setOrderStatus("COMPLETED");
        order.setFinishTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        orderRepository.save(order);
        
        DiningTable table = tableRepository.findById(order.getTableId()).orElse(null);
        if (table != null) {
            List<Order> activeOrders = orderRepository.findCurrentOrdersByTable(table.getId());
            if (activeOrders.isEmpty()) {
                table.setStatus("IDLE");
                tableRepository.save(table);
            }
        }
        
        webSocketHandler.broadcastOrderUpdate(convertToVO(order));
    }
    
    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        if ("COMPLETED".equals(order.getOrderStatus())) {
            throw new RuntimeException("已完成的订单无法取消");
        }
        
        order.setOrderStatus("CANCELLED");
        order.setUpdateTime(LocalDateTime.now());
        orderRepository.save(order);
        
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        for (OrderItem item : items) {
            if ("PENDING".equals(item.getDishStatus()) || "COOKING".equals(item.getDishStatus())) {
                dishRepository.increaseStock(item.getDishId(), item.getQuantity());
            }
        }
        
        DiningTable table = tableRepository.findById(order.getTableId()).orElse(null);
        if (table != null) {
            List<Order> activeOrders = orderRepository.findCurrentOrdersByTable(table.getId());
            if (activeOrders.isEmpty()) {
                table.setStatus("IDLE");
                tableRepository.save(table);
            }
        }
        
        webSocketHandler.broadcastOrderUpdate(convertToVO(order));
    }
    
    @Override
    @Transactional
    public void payOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        order.setPayStatus("PAID");
        order.setPayTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        orderRepository.save(order);
        
        webSocketHandler.broadcastOrderUpdate(convertToVO(order));
    }
    
    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long seq = ORDER_COUNTER.incrementAndGet() % 1000;
        return timestamp + String.format("%03d", seq);
    }
    
    private OrderVO loadOrderDetails(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        order.setItems(items);
        
        DiningTable table = tableRepository.findById(order.getTableId()).orElse(null);
        if (table != null) {
            order.setTableNo(table.getTableNo());
        }
        
        return convertToVO(order);
    }
    
    private OrderVO convertToVO(Order order) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setTableId(order.getTableId());
        vo.setTableNo(order.getTableNo());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setPayAmount(order.getPayAmount());
        vo.setPayStatus(order.getPayStatus());
        vo.setOrderStatus(order.getOrderStatus());
        vo.setRemark(order.getRemark());
        vo.setPayTime(order.getPayTime());
        vo.setFinishTime(order.getFinishTime());
        vo.setCreateTime(order.getCreateTime());
        
        if (order.getItems() != null) {
            vo.setItems(order.getItems().stream().map(this::convertToItemVO).collect(Collectors.toList()));
        }
        
        return vo;
    }
    
    private OrderVO.OrderItemVO convertToItemVO(OrderItem item) {
        OrderVO.OrderItemVO vo = new OrderVO.OrderItemVO();
        vo.setId(item.getId());
        vo.setDishId(item.getDishId());
        vo.setDishName(item.getDishName());
        vo.setDishPrice(item.getDishPrice());
        vo.setQuantity(item.getQuantity());
        vo.setSubtotal(item.getSubtotal());
        vo.setDishStatus(item.getDishStatus());
        vo.setImage(item.getImage());
        return vo;
    }
}
