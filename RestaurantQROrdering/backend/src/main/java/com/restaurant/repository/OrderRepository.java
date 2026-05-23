package com.restaurant.repository;

import com.restaurant.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Order findByOrderNo(String orderNo);
    List<Order> findByTableIdOrderByCreateTimeDesc(Long tableId);
    
    @Query("SELECT o FROM Order o WHERE o.orderStatus IN ('PENDING', 'CONFIRMED', 'COOKING') ORDER BY o.createTime ASC")
    List<Order> findActiveOrders();
    
    List<Order> findByOrderStatusIn(List<String> statuses);
    
    @Query("SELECT o FROM Order o WHERE o.tableId = :tableId AND o.orderStatus NOT IN ('COMPLETED', 'CANCELLED') ORDER BY o.createTime DESC")
    List<Order> findCurrentOrdersByTable(Long tableId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createTime BETWEEN :start AND :end")
    Long countByCreateTimeBetween(LocalDateTime start, LocalDateTime end);
}
