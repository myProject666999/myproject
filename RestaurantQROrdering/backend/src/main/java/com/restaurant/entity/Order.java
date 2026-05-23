package com.restaurant.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 32)
    private String orderNo;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "pay_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal payAmount = BigDecimal.ZERO;

    @Column(name = "pay_status", nullable = false, length = 20)
    private String payStatus = "UNPAID";

    @Column(name = "order_status", nullable = false, length = 20)
    private String orderStatus = "PENDING";

    private String remark;

    @Column(name = "pay_time")
    private LocalDateTime payTime;

    @Column(name = "finish_time")
    private LocalDateTime finishTime;

    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime = LocalDateTime.now();

    @Column(name = "update_time", nullable = false)
    private LocalDateTime updateTime = LocalDateTime.now();

    @Transient
    private List<OrderItem> items = new ArrayList<>();

    @Transient
    private String tableNo;
}
