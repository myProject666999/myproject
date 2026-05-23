package com.restaurant.controller;

import com.restaurant.dto.Result;
import com.restaurant.entity.DiningTable;
import com.restaurant.service.TableService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
@RequiredArgsConstructor
public class TableController {
    
    private final TableService tableService;
    
    @GetMapping
    public Result<List<DiningTable>> getAllTables() {
        return Result.success(tableService.getAllTables());
    }
    
    @GetMapping("/{id}")
    public Result<DiningTable> getTableById(@PathVariable Long id) {
        return Result.success(tableService.getTableById(id));
    }
    
    @GetMapping("/no/{tableNo}")
    public Result<DiningTable> getTableByNo(@PathVariable String tableNo) {
        return Result.success(tableService.getTableByNo(tableNo));
    }
    
    @PostMapping("/bind/{tableNo}")
    public Result<Void> bindTable(@PathVariable String tableNo, HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        tableService.bindTable(tableNo, sessionId);
        return Result.success();
    }
    
    @PostMapping("/unbind")
    public Result<Void> unbindTable(HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        tableService.unbindTable(sessionId);
        return Result.success();
    }
    
    @GetMapping("/current")
    public Result<DiningTable> getCurrentTable(HttpServletRequest request) {
        String sessionId = request.getSession().getId();
        return Result.success(tableService.getCurrentTable(sessionId));
    }
    
    @PostMapping
    public Result<DiningTable> createTable(@RequestBody DiningTable table) {
        return Result.success(tableService.createTable(table));
    }
    
    @PutMapping("/{id}")
    public Result<DiningTable> updateTable(@PathVariable Long id, @RequestBody DiningTable table) {
        return Result.success(tableService.updateTable(id, table));
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return Result.success();
    }
}
