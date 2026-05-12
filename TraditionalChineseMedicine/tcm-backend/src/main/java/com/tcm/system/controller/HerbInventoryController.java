package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.HerbInventory;
import com.tcm.system.service.HerbInventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class HerbInventoryController {

    @Autowired
    private HerbInventoryService inventoryService;

    @GetMapping
    public Result<List<HerbInventory>> list(@RequestParam(required = false) Long herbId) {
        return Result.success(inventoryService.list(herbId));
    }

    @GetMapping("/{id}")
    public Result<HerbInventory> getById(@PathVariable Long id) {
        return Result.success(inventoryService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody HerbInventory inventory) {
        return Result.success(inventoryService.save(inventory));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody HerbInventory inventory) {
        return Result.success(inventoryService.update(inventory));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(inventoryService.delete(id));
    }
}
