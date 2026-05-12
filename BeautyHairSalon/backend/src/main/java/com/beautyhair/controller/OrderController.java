
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Order;
import com.beautyhair.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/page")
    public Result<PageResult<Order>> getOrderPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        PageResult<Order> result = orderService.getOrderPage(page, size, keyword, status, startDate, endDate);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Order> getById(@PathVariable Long id) {
        Order order = orderService.getById(id);
        return Result.success(order);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Order order) {
        orderService.add(order);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Order order) {
        orderService.update(order);
        return Result.success("更新成功");
    }

    @PutMapping("/status/{id}/{status}")
    public Result<Void> updateStatus(@PathVariable Long id, @PathVariable Integer status) {
        orderService.updateStatus(id, status);
        return Result.success("状态更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        orderService.delete(id);
        return Result.success("删除成功");
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(orderService.getOrderStatistics());
    }

    @GetMapping("/daily-report")
    public Result<Map<String, Object>> getDailyReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(orderService.getDailyReport(date));
    }
}
