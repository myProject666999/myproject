
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Order;
import com.beautyhair.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderMapper orderMapper;

    public PageResult<Order> getOrderPage(int page, int size, String keyword, Integer status,
                                           LocalDate startDate, LocalDate endDate) {
        Page<Order> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Order::getOrderNo, keyword)
                    .or().like(Order::getCustomerName, keyword)
                    .or().like(Order::getPhone, keyword));
        }
        if (status != null) {
            wrapper.eq(Order::getStatus, status);
        }
        if (startDate != null) {
            wrapper.ge(Order::getCreateTime, startDate.atStartOfDay());
        }
        if (endDate != null) {
            wrapper.le(Order::getCreateTime, endDate.plusDays(1).atStartOfDay());
        }
        wrapper.orderByDesc(Order::getCreateTime);

        IPage<Order> result = orderMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public Order getById(Long id) {
        return orderMapper.selectById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Order order) {
        if (StrUtil.isBlank(order.getOrderNo())) {
            order.setOrderNo("ORD" + System.currentTimeMillis());
        }
        if (order.getStatus() == null) {
            order.setStatus(1);
        }
        orderMapper.insert(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Order order) {
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long id, Integer status) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
        orderMapper.updateById(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        orderMapper.deleteById(id);
    }

    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> stats = new HashMap<>();

        LocalDate today = LocalDate.now();
        java.math.BigDecimal todayRevenue = orderMapper.sumRevenueByDate(today);
        Long todayOrderCount = orderMapper.selectCount(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getStatus, 2)
                        .ge(Order::getCreateTime, today.atStartOfDay())
        );

        stats.put("todayRevenue", todayRevenue != null ? todayRevenue : java.math.BigDecimal.ZERO);
        stats.put("todayOrderCount", todayOrderCount);

        List<Map<String, Object>> last7DaysRevenue = orderMapper.getLast7DaysRevenue();
        stats.put("last7DaysRevenue", last7DaysRevenue);

        return stats;
    }

    public Map<String, Object> getDailyReport(LocalDate date) {
        Map<String, Object> report = new HashMap<>();

        java.math.BigDecimal revenue = orderMapper.sumRevenueByDate(date);
        Long orderCount = orderMapper.selectCount(
                new LambdaQueryWrapper<Order>()
                        .eq(Order::getStatus, 2)
                        .ge(Order::getCreateTime, date.atStartOfDay())
                        .lt(Order::getCreateTime, date.plusDays(1).atStartOfDay())
        );

        report.put("date", date.toString());
        report.put("revenue", revenue != null ? revenue : java.math.BigDecimal.ZERO);
        report.put("orderCount", orderCount);

        return report;
    }
}
