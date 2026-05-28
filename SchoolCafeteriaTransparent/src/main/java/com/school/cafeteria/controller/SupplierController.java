package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.Supplier;
import com.school.cafeteria.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/supplier")
public class SupplierController {

    @Autowired
    private SupplierService supplierService;

    @GetMapping("/public/list")
    public Result<List<Supplier>> getAll() {
        List<Supplier> list = supplierService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/active")
    public Result<List<Supplier>> getActive() {
        List<Supplier> list = supplierService.findActive();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<Supplier> getById(@PathVariable Long id) {
        Optional<Supplier> supplier = supplierService.findById(id);
        return supplier.map(Result::success).orElse(Result.error("供应商不存在"));
    }

    @GetMapping("/public/search")
    public Result<List<Supplier>> search(@RequestParam String keyword) {
        List<Supplier> list = supplierService.searchByName(keyword);
        return Result.success(list);
    }

    @PostMapping
    public Result<Supplier> create(@RequestBody Supplier supplier) {
        Supplier saved = supplierService.save(supplier);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<Supplier> update(@PathVariable Long id, @RequestBody Supplier supplier) {
        Optional<Supplier> existing = supplierService.findById(id);
        if (existing.isEmpty()) {
            return Result.error("供应商不存在");
        }
        supplier.setId(id);
        Supplier saved = supplierService.save(supplier);
        return Result.success("更新成功", saved);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return Result.success();
    }
}
