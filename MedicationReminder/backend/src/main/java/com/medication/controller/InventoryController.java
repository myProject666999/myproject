package com.medication.controller;

import com.medication.common.Result;
import com.medication.entity.Inventory;
import com.medication.service.InventoryService;
import com.medication.vo.InventoryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/inventories")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @GetMapping
    public Result<List<InventoryVO>> list() {
        return Result.success(inventoryService.listAll());
    }

    @GetMapping("/user/{userId}")
    public Result<List<InventoryVO>> listByUserId(@PathVariable Long userId) {
        return Result.success(inventoryService.listByUserId(userId));
    }

    @GetMapping("/low-stock/{userId}")
    public Result<List<InventoryVO>> listLowStock(@PathVariable Long userId) {
        return Result.success(inventoryService.listLowStock(userId));
    }

    @GetMapping("/{id}")
    public Result<Inventory> getById(@PathVariable Long id) {
        return Result.success(inventoryService.getById(id));
    }

    @PostMapping
    public Result<Inventory> save(@RequestBody Inventory inventory) {
        inventoryService.save(inventory);
        return Result.success(inventory);
    }

    @PutMapping
    public Result<Inventory> update(@RequestBody Inventory inventory) {
        inventoryService.updateById(inventory);
        return Result.success(inventory);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        inventoryService.removeById(id);
        return Result.success();
    }
}
